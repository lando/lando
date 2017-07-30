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
    var certs = ['/certs/cert.crt', '/certs/cert.key'].join(',');
    var cmd = [
      '/entrypoint.sh',
      '--defaultEntryPoints=https,http',
      '--docker',
      '--docker.domain=' + domain,
      '--entryPoints="Name:http Address::80"',
      '--entrypoints="Name:https Address::443 TLS:' + certs + '"',
      '--logLevel=DEBUG',
      '--web',
    ].join(' ');

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
        image: 'traefik:1.3-alpine',
        entrypoint: '/lando-entrypoint.sh',
        command: cmd,
        labels: {
          'io.lando.container': 'TRUE'
        },
        environment: {
          LANDO_SERVICE_TYPE: 'proxy'
        },
        networks: ['edge'],
        ports: [
          [engineHost, http, '80'].join(':'),
          [engineHost, https, '443'].join(':'),
          [proxyDash, 8080].join(':')
        ],
        volumes: [
          '/var/run/docker.sock:/var/run/docker.sock',
          '/dev/null:/traefik.toml',
          '$LANDO_ENGINE_SCRIPTS_DIR/lando-entrypoint.sh:/lando-entrypoint.sh',
          '$LANDO_ENGINE_SCRIPTS_DIR/add-cert.sh:/scripts/add-cert.sh'
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
        version: lando.config.composeVersion,
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
   * Map new proxy config format to old one
   */
  var map2Legacy = function(data, name) {

    // Start a config collector
    var config = [];
    var secures = [];

    // Get 443z
    _.forEach(data, function(datum) {
      if (_.get(datum.split(':'), '[1]', '80') === '80') {
        secures.push([datum.split(':')[0], '443'].join(':'));
      }
    });

    // Map to array of port/host objects
    var phosts = _.map(data.concat(secures), function(datum) {
      return {
        port: _.get(datum.split(':'), '[1]', '80') + '/tcp',
        host: datum.split(':')[0]
      };
    });

    // Start to build the config object
    _.forEach(_.groupBy(phosts, 'port'), function(value, key) {
      config.push({
        port: key,
        hosts: _.map(value, 'host')
      });
    });

    // Determine the hostname situation
    _.forEach(config, function(service) {

      // Handle secure
      if (service.port === '443/tcp') {
        service.secure = true;
      }

      // Basic collectors
      var subdomains = [];
      var custom = [];

      // Go through each host and try to build the legacy confg
      _.forEach(service.hosts, function(host) {

        // Handle proxyDomain hosts
        if (_.endsWith(host, lando.config.proxyDomain)) {

          // Save the original
          var original = host;

          // Strip opts
          var sopts = {
            length: host.length - lando.config.proxyDomain.length - 1,
            omission: ''
          };

          // Start to strip the host down
          host = _.truncate(host, sopts);

          // Set default if stripped is the app.name
          if (host === name) {
            service.default = true;
          }

          // Strip more to remove any app.name refs
          if (_.endsWith(host, name)) {
            sopts.length = host.length - name.length - 1;
            host = _.truncate(host, sopts);
            if (!_.isEmpty(host)) {
              subdomains.push(host);
            }
          }

          // Else should be custom
          else {
            custom.push(original);
          }

        }

        // Must be a custom domain
        else {
          custom.push(host);
        }
      });

      // Add in subdomains if they are not empty
      if (!_.isEmpty(subdomains)) {
        service.subdomains = subdomains;
      }

      // Ditto custom domains
      if (!_.isEmpty(custom)) {
        service.custom = custom;
      }

      // Remove the old hosts
      delete service.hosts;

    });

    // Return the mapped things
    return config;

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
    var routes = _.map(hostnames, function(hostname) {

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

    // Return the route object
    return {
      port: route.port,
      urls: routes
    };

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

      // If this is the new proxy config format lets translate it to the old
      // one
      if (!_.isEmpty(data) && _.isString(data[0])) {
        data = map2Legacy(data, app.name);
      }

      // Map each route into an object of ports and urls
      var routes = _.map(data, function(route) {
        return getLegacyRouteUrls(route, app.name, ports);
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
      lando.log.error('Duplicate URL detected: %j', urlCount);
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
  var addUrls = function(app, happyPorts) {

    // Use happyPorts or set the default
    var ports = happyPorts || [];

    // Get thet proxy data
    return getProxyData(app)

    // Map into info
    .map(function(service) {
      if (app.info[service.name]) {

        // Get old urls
        var old = app.info[service.name].urls || [];

        var updated = _.map(service.routes, function(route) {
          var getPorts = _.includes(ports, route.port) || _.isEmpty(ports);
          return (getPorts) ? route.urls : [];
        });

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
  lando.events.on('post-instantiate-app', function(app) {

    // If the proxy is on and our app has config
    if (lando.config.proxy === 'ON' && !_.isEmpty(app.config.proxy)) {

      // Add relevant URLS
      app.events.on('post-start', function() {
        return addUrls(app, ['80/tcp', '443/tcp']);
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

      app.events.on('pre-start', 1, function() {

        // Get project name
        var project = app.project || app.name;

        // Kick off the proxy compose file
        var compose = {
          version: lando.config.composeVersion,
          networks: {
            'lando_proxyedge': {
              external: {
                name: 'lando_edge'
              }
            }
          },
          services: {}
        };

        // Start the proxy
        return startProxy()

        // Get the data
        .then(function() {
          return getProxyData(app);
        })

        // Go through those services one by one
        .map(function(service) {

          // Get name and port
          var name = service.name;
          var port = _.get(service, 'routes[0].port', '80');

          // If port is 443 switch back to 80
          if (port === 443) {
            port = 80;
          }

          // Get hostnames without ports
          var hosts = _.map(_.get(service, 'routes[0].urls', []), function(u) {
            var hasProtocol = !_.isEmpty(u.split('://')[1]);
            var f = (hasProtocol) ? (u.split('://')[1]) : (u.split('://')[0]);
            return f.split(':')[0];
          });

          // Add in relevant labels if we have hosts
          if (!_.isEmpty(hosts)) {
            var labels = _.get(app.services[service.name], 'labels', {});
            labels['traefik.docker.network'] = 'lando_edge';
            labels['traefik.frontend.rule'] = 'Host:' + hosts.join(',');
            labels['traefik.port'] = _.toString(port);

            // Get any networks that might already exist
            var defaultNets = {'lando_proxyedge': {}, 'default': {}};
            var preNets = _.get(app.services[name], 'networks', {});

            // Start building the augment
            compose.services[name] = {
              networks: _.mergeWith(defaultNets, preNets, lando.utils.merger),
              labels: labels,
            };
          }

          // Send hosts down the pipe
          return hosts;

        })

        // Add extra hosts to all the service
        .then(function(hosts) {

          // Compute extra hosts
          var hostList = _.map(_.flatten(hosts), function(host) {
            return [host, lando.config.env.LANDO_ENGINE_REMOTE_IP].join(':');
          });

          // And add them if applicable
          if (!_.isEmpty(hostList)) {
            _.forEach(_.keys(app.services), function(name) {

              // Look for preexisting extra_hosts
              var peeh = [];
              if (!_.isEmpty(_.get(app.services[name], 'extra_hosts', []))) {
                peeh = _.get(app.services[name], 'extra_hosts', []);
              }

              // Merge the whole shebang
              compose.services[name] = _.merge(compose.services[name], {
                'extra_hosts': _.flatten(hostList.concat(peeh))
              });

            });
          }

        })

        // Spit out the proxy compose file
        .then(function() {

          // Write the services
          var projectDir = path.join(lando.config.userConfRoot, 'tmp', project);
          var fileName = [project, 'proxy', _.uniqueId()].join('-');
          var file = path.join(projectDir, fileName + '.yml');

          // Add that file to our compose list
          app.compose.push(lando.utils.compose(file, compose));
          lando.log.verbose('App %s has proxy compose file %s', project, file);

        });
      });

    }

  });

};
