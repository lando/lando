/**
 * This does the proxying
 *
 * @name proxy
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var path = require('path');
  var Promise = lando.Promise;

  // Fixed location of our proxy service compose file
  var proxyDir = path.join(lando.config.userConfRoot, 'proxy');
  var proxyFile = path.join(proxyDir, 'proxy' + '.yml');

  /*
   * Helper to extract ports from inspect data
   */
  var pp = function(port) {
    return 'NetworkSettings.Ports.' + port + '/tcp[0].HostPort';
  };

  /*
   * Return the proxy service
   */
  var getProxy = function(file) {

    // Log
    lando.log.debug('Run proxy service from %s', file);

    // Return engine object
    return {
      compose: [file],
      project: 'lando',
      opts: {
        services: ['proxy']
      }
    };
  };

  /*
   * Return an open port
   */
  var findPort = function(preferred, others, secure) {

    // Protocol
    var protocol = (secure) ? 'https://' : 'http://';

    // Collect all urls to scan
    var urls = _.map(_.flatten([preferred, others]), function(port) {
      return protocol + [lando.config.engineHost, port].join(':');
    });

    // Scan the urls
    return lando.utils.scanUrls(urls, {max: 1, waitCodes: []})

    // Filter out ports that are in use
    .filter(function(url) {
      return url.status === false;
    })

    // Only grab the url
    .map(function(url) {
      return url.url.split(':')[2];
    })

    // Select the port
    .then(function(ports) {
      var port = (_.includes(ports, preferred)) ? preferred : ports[0];
      return {protocol: protocol, port: port};
    });

  };

  /*
   * Scan ports to find available ones for proxy
   */
  var scanPorts = function() {

    // Get our config
    var httpPort = lando.config.proxyHttpPort;
    var httpFallbacks = lando.config.proxyHttpFallbacks;
    var httpsPort = lando.config.proxyHttpsPort;
    var httpsFallbacks = lando.config.proxyHttpsFallbacks;

    // Determine the ports for our proxy
    return Promise.all([
      findPort(httpPort, httpFallbacks),
      findPort(httpsPort, httpsFallbacks, true)
    ])

    // Discover ports and return object
    .then(function(data) {

      // Get the http port
      var http = _.find(data, function(datum) {
        return datum.protocol === 'http://';
      }).port;

      // Get the https port
      var https = _.find(data, function(datum) {
        return datum.protocol === 'https://';
      }).port;

      // Return our ports
      return {
        http: http,
        https: https
      };

    });

  };

  /*
   * Get the best ports to use
   */
  var getPorts = function() {

    // If there is no proxy file then lets scan the ports
    if (!fs.existsSync(proxyFile)) {
      return scanPorts();
    }

    // If the proxy has been created already lets see if we can use that
    else {

      // Inspect current proxy to make sure we dont incorrectly rebuild
      return lando.engine.inspect(getProxy(proxyFile))

      // Look at the proxy data
      .then(function(data) {

        // If the proxy is running, lets make sure we hook up the ports that the proxy
        // is already using. If we dont do this the proxy will always show as "changed"
        if (_.get(data, 'State.Running', false)) {

          // Extract the ports from the running proxy
          var preferredHttp = lando.config.proxyHttpPort;
          var preferredHttps = lando.config.proxyHttpsPort;
          var httpPort = _.get(data, pp('80'), preferredHttp);
          var httpsPort = _.get(data, pp('443'), preferredHttps);

          // Return our ports
          return {
            http: httpPort,
            https: httpsPort,
          };

        }

        // If proxy is off then lets scan in case something else has taken the old ports
        else {
          return scanPorts();
        }

      });

    }

  };

  /*
   * Create the proxy service file
   */
  var buildProxy = function() {

    // Get some stuff for our things
    var domain = lando.config.proxyDomain;
    var engineHost = lando.config.engineHost;
    var proxyDash = lando.config.proxyDash;
    var cmd = ['--web', '--docker', '--docker.domain=' + domain];

    // Determine the ports and networks for our proxy
    return getPorts()

    // Configure the proxy and set the file
    .then(function(ports) {

      // Get the ports
      var http = ports.http;
      var https = ports.https;

      // Log
      lando.log.verbose('Proxying on %s:%s', engineHost, http);
      lando.log.verbose('Proxying on %s:%s', engineHost, https);

      // Proxy service
      var proxy = {
        image: 'traefik',
        command: cmd.join(' ') + ' --logLevel=DEBUG',
        labels: {
          'io.lando.container': 'TRUE'
        },
        networks: ['edge'],
        ports: [
          [engineHost, http, '80'].join(':'),
          //[engineHost, https, '443'].join(':'),
          [proxyDash, 8080].join(':')
        ],
        volumes: [
          '/var/run/docker.sock:/var/run/docker.sock',
          '/dev/null:/traefik.toml'
        ],
        restart: 'on-failure'
      };

      // Networks
      var networks = {
        edge: {
          driver: 'bridge'
        }
      };

      // Get the new proxy service
      return {
        version: '3',
        services: {proxy: proxy},
        networks: networks
      };

    });

  };

  /*
   * Get our proxy data
   */
  var startProxy = function() {

    // Build the proxy
    return buildProxy()

    // Set the proxy
    .then(function(proxy) {

      // If we are building the proxy for the first time
      if (!fs.existsSync(proxyFile)) {
        lando.log.verbose('Starting proxy for the first time');
        lando.utils.compose(proxyFile, proxy);
      }

      // We already have a proxy, lets see if its different and rebuild if needed
      else {

        // Get the current proxy
        var proxyOld = lando.yaml.load(proxyFile);

        // If the proxy is different, rebuild with new and stop the old
        if (JSON.stringify(proxyOld) !== JSON.stringify(proxy)) {
          lando.log.verbose('Proxy has changed, rebuilding');
          lando.utils.compose(proxyFile, proxy);
        }

      }

    })

    // Try to start the proxy
    .then(function() {
      return lando.engine.start(getProxy(proxyFile));
    });

  };

  /*
   * Legacy parse a proxy config object into an array of URLs
   */
  var getLegacyRouteUrls = function(route, name, ports) {

    // Get the domain
    var domain = lando.config.proxyDomain;

    // Start with a hostnames collector
    var hostnames = [];

    // Handle 'default' key
    if (route.default) {
      hostnames.push([name, domain].join('.'));
    }

    // Handle legacy 'hostname' key
    if (route.hostname) {
      hostnames.push([route.hostname, name, domain].join('.'));
    }

    // Handle 'subdomains'
    if (route.subdomains) {
      _.forEach(route.subdomains, function(subdomain) {
        hostnames.push([subdomain, name, domain].join('.'));
      });
    }

    // Handle 'custom'
    if (route.custom) {
      _.forEach(route.custom, function(url) {
        hostnames.push(url);
      });
    }

    // Determine whether the protocol is http or https
    var protocol = (route.secure) ? 'https://' : 'http://';

    // Return an array of parsed hostnames
    return _.map(hostnames, function(hostname) {

      // Optional port TBD
      var port = '';

      // Determine whether we need to add a port
      if (!route.secure && ports.http !== '80') {
        port = ':' + ports.http;
      }

      // Or we need to add a secure port
      else if (route.secure && ports.https !== '443') {
        port = ':' + ports.https;
      }

      // Return the completed URL
      return protocol + hostname + port;

    });

  };

  /*
   * Get a list of URLs and their counts
   */
  var getUrlsCounts = function(services) {
    // Get routes and flatten
    var routes = _.flatten(_.map(services, 'routes'));
    // Get URLs and flatten
    var urls = _.flatten(_.map(routes, 'urls'));
    // Check for duplicate URLs
    return _.countBy(urls);
  };

  /*
   * Parse our config into an array of service objects and do
   * some basic validation
   */
  var parseServices = function(app, ports) {

    // Get the proxy config
    var config = app.config.proxy || {};

    // Transform our config into services objects
    var services = _.map(config, function(data, key) {

      // Map each route into an object of ports and urls
      var routes = _.map(data, function(route) {
        return {
          port: route.port,
          urls: getLegacyRouteUrls(route, app.name, ports)
        };
      });

      // Return the service
      return {
        app: app.name,
        name: key,
        routes: routes
      };

    });

    // Get a count of the URLs so we can check for dupes
    var urlCount = getUrlsCounts(services);
    var hasDupes = _.reduce(urlCount, function(result, count) {
      return count > 1 || result;
    }, false);

    // Throw an error if there are dupes
    if (hasDupes) {
      throw new Error('Duplicate URL detected: %j', urlCount);
    }

    // Return the list
    return services;

  };

  /*
   * Helper to get proxy data
   */
  var getProxyData = function(app) {

    // Inspect
    return lando.engine.inspect(getProxy(proxyFile))

    // Grab the ports we are using and then parse the services if our app
    .then(function(data) {

      // Get our ports from the data
      var preferredHttp = lando.config.proxyHttpPort;
      var preferredHttps = lando.config.proxyHttpsPort;
      var httpPort = _.get(data, pp('80'), preferredHttp);
      var httpsPort = _.get(data, pp('443'), preferredHttps);
      var ports = {http: httpPort, https: httpsPort};

      // Add the parsed services to the app
      return parseServices(app, ports) || {};

    });

  };

  /*
   * Helper to add URLS
   */
  var addUrls = function(app) {

    // Get thet proxy data
    return getProxyData(app)

    // Map into info
    .map(function(service) {
      if (app.info[service.name]) {

        // Get old urls
        var old = app.info[service.name].urls || [];
        var updated = _.map(service.routes, 'urls');

        // Log
        lando.log.debug('Adding app URLs', updated);

        // Merge our list together
        app.info[service.name].urls = _.flatten(old.concat(updated));
      }
    });

  };

  // Turn the proxy off on powerdown if applicable
  lando.events.on('poweroff', function() {
    if (lando.config.proxy === 'ON' && fs.existsSync(proxyFile)) {
      return lando.engine.stop(getProxy(proxyFile));
    }
  });

  // Turn on the proxy automatically and get info about its urls
  lando.events.on('post-instantiate-app', 2, function(app) {

    // If the proxy is on and our app has config
    if (lando.config.proxy === 'ON' && !_.isEmpty(app.config.proxy)) {

      // Make sure the proxy is up and ready
      app.events.on('pre-start', 1, function() {
        return startProxy();
      });

      // Add relevant URLS
      app.events.on('post-start', function() {
        return addUrls(app);
      });

      // Add proxy URLS to our app info
      app.events.on('pre-info', function() {

        // Kick off the chain by seeing if our app is up
        return lando.app.isRunning(app)

        // If app is not running then we are done
        .then(function(isRunning) {

          // Log
          lando.log.verbose('App %s is up = %s', app.name, isRunning);

          // If app is running then continue
          if (isRunning) {
            return addUrls(app);
          }

        });

      });

      // Prep the networks
      var networks = app.networks || {};

      // Add in the proxy network
      var edge = {
        'lando_proxyedge': {
          external: {
            name: 'lando_edge'
          }
        }
      };

      // Merge
      app.networks = _.merge(networks, edge);

      // GEt the proxy data
      return getProxyData(app)

      // Go through those services one by one and add dns entries
      .map(function(service) {

        // Add in the edgenet
        var networks = _.get(app.services[service.name], 'networks', []);
        networks.push('lando_proxyedge', 'default');
        _.set(app.services[service.name], 'networks', networks);

        // Get name and port
        var name = service.name;
        var port = _.get(service, 'routes[0].port', '80');

        // Get hostnames
        var hosts = _.map(_.get(service, 'routes[0].urls', []), function(url) {
          var hasProtocol = !_.isEmpty(url.split('://')[1]);
          return (hasProtocol) ? (url.split('://')[1]) : (url.split('://')[0]);
        });

        // Add in relevant labels
        var labels = _.get(app.services[service.name], 'labels', {});
        labels['traefik.backend'] = name;
        labels['traefik.port'] = _.toString(port);
        labels['traefik.frontend.rule'] = 'Host:' + hosts.join(',');
        _.set(app.services[service.name], 'labels', labels);

      });

    }

  });

};
