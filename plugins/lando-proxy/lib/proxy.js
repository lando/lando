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
  var redis = require('redis');
  var u = require('url');
  var yaml = lando.node.yaml;

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
   * Define the proxy service
   */
  var getProxyService = function(http, https, redis, networks) {

    // Log
    lando.log.debug('Proxy with http %s https %s redis %s', http, https, redis);

    // Return the compose object
    return {
      image: 'kalabox/proxy:stable',
      environment: {
        'DOMAIN': lando.config.proxyDomain || 'lndo.site' || '.local'
      },
      labels: {
        'io.lando.container': 'TRUE'
      },
      networks: networks,
      ports: [
        [lando.config.engineHost, http, '80'].join(':'),
        [lando.config.engineHost, https, '443'].join(':'),
        [lando.config.engineHost, redis, '8160'].join(':')
      ],
      restart: 'on-failure'
    };
  };

  /*
   * Return the services for this app
   */
  var getAppService = function(app, service) {
    return {
      compose: _.uniq(app.compose),
      project: app.name,
      opts: {
        app: app,
        services: [service]
      }
    };
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

      // Get the redis port
      var redis = lando.config.proxyRedisPort;

      // Return our ports
      return {
        http: http,
        https: https,
        redis: redis
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

          // Rebuild the ports on the new proxy file with ports already in use
          var redis = lando.config.proxyRedisPort;

          // Return our ports
          return {
            http: httpPort,
            https: httpsPort,
            redis: redis
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
   * Get networks we need for this
   */
  var getNetworks = function() {

    // Options to filter the networks
    var opts = {
      filters: {
        driver: {bridge: true},
        name: {_default: true}
      }
    };

    // Get the networks
    return lando.networks.get(opts)

    // Filter out lando_default
    .filter(function(network) {
      return network.Name !== 'lando_default';
    })

    // Map to list of networks
    .map(function(network) {
      return network.Name;
    });

  };

  /*
   * Create the proxy service file
   */
  var buildProxy = function() {

    // Determine the ports and networks for our proxy
    return Promise.all([
      getPorts(),
      getNetworks()
    ])

    // Configure the proxy and set the file
    .then(function(data) {

      // Split the data
      var ports = data[0];
      var networks = data[1];

      // Get the ports
      var http = ports.http;
      var https = ports.https;
      var redis = ports.redis;

      // Log
      var engineHost = lando.config.engineHost;
      lando.log.verbose('Proxying on %s:%s', engineHost, http);
      lando.log.verbose('Proxying on %s:%s', engineHost, https);
      lando.log.verbose('Proxy redis on %s:%s', engineHost, redis);

      // Start up a collector for our top level networks key
      var tlNetworks = {};

      // Build the TL networks key
      _.forEach(networks, function(network) {
        tlNetworks[network] = {external: true};
      });

      // Get the new proxy service
      return {
        version: '3',
        services: {
          proxy: getProxyService(http, https, redis, networks)
        },
        networks: tlNetworks
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
        var proxyOld = yaml.safeLoad(fs.readFileSync(proxyFile));

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
   * Parse a proxy config object into an array of URLs
   */
  var getRouteUrls = function(route, name, ports) {

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
          urls: getRouteUrls(route, app.name, ports)
        };
      });

      // Return the service
      return {
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
   * Return the redis client
   *
   * This allows us to retry the connection a few times just in case redis
   * is slow to start
   */
  var getRedisClient = function() {
    return Promise.retry(function() {
      var REDIS_PORT = lando.config.proxyRedisPort;
      var REDIS_IP = lando.config.engineHost;
      lando.log.verbose('Connecting to redis on %s:%s', REDIS_IP, REDIS_PORT);
      return redis.createClient(REDIS_PORT, REDIS_IP);
    });
  };

  /*
   * Adds an entry to redis
   *
   * This allows us to retry the connection a few times just in case redis
   * is slow to start
   */
  var addRedisEntry = function(key, dest, containerName) {

    // Attempt to connect to redis
    return getRedisClient()

    // Run the redis query and then quit
    .then(function(redis) {
      lando.log.debug('Setting DNS %s => %s on %s', key, dest, containerName);
      return Promise.fromNode(function(cb) {
        redis.multi()
        .del(key)
        .rpush(key, containerName)
        .rpush(key, dest)
        .exec(cb);
      })
      .then(function() {
        redis.quit();
      });
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

      // Make sure the proxy is up and ready
      app.events.on('post-start', 1, function() {
        return startProxy();
      });

      // Add entries to redis for hipache
      app.events.on('post-start', function() {

        // GEt the proxy data
        return getProxyData(app)

        // Go through those services one by one and add dns entries
        .map(function(service) {

          // Add the urls
          if (app.info[service.name]) {

            // Get old urls
            var old = app.info[service.name].urls || [];
            var updated = _.map(service.routes, 'urls');

            // Log
            lando.log.debug('Adding app URLs', updated);

            // Merge our list together
            app.info[service.name].urls = _.flatten(old.concat(updated));

          }

          // Log the service getting confed
          lando.log.verbose('Configuring DNS for %s service.', service.name);

          // Inspect the service to be proxies
          return lando.engine.inspect(getAppService(app, service.name))

          // Grab our port information from docker
          .then(function(data) {

            // Get project name
            var labels = _.get(data, 'Config.Labels');
            var project = labels['com.docker.compose.project'];
            var network = [project, 'default'].join('_');

            // Get network IP path
            var ipPath = ['NetworkSettings', 'Networks', network, 'IPAddress'];

            // Get port information from container query.
            var ip = _.get(data, ipPath.join('.'));

            // Loop through each proxy.
            return Promise.map(service.routes, function(route) {

              // Get port for this proxy from port information.
              var port = route.port.split('/')[0];

              // Loop through each url and add an entry to redis
              return Promise.map(route.urls, function(url) {

                // Build a URL formatted correctly for hipache
                url = u.format({
                  protocol: u.parse(url).protocol,
                  hostname: u.parse(url).hostname,
                  slashes: true
                });

                // Add the record
                return addRedisEntry(
                  ['frontend', url].join(':'),
                  u.parse(url).protocol + '//' + ip + ':' + port,
                  _.trimStart(data.Name, '/')
                );

              });

            });
          });
        });

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
          // NOTE: we assume if the app is running then so is the proxy
          if (isRunning) {

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

          }

        });

      });

    }

  });

};
