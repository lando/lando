/**
 * This does the proxying
 *
 * @name proxy
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var cache = lando.cache;
  var fs = lando.node.fs;
  var path = require('path');
  var Promise = lando.Promise;
  var redis = require('redis');
  var u = require('url');

  // Fixed location of our proxy service compose file
  var proxyDir = path.join(lando.config.userConfRoot, 'proxy');
  var proxyFile = path.join(proxyDir, 'proxy' + '.yml');

  /*
   * Define the proxy service
   */
  var getProxyService = function(http, https, redis) {

    // Log
    lando.log.debug('Proxy with http %s https %s redis %s', http, https, redis);

    // Return the compose object
    return {
      image: 'kalabox/proxy:stable',
      environment: {
        'DOMAIN': lando.config.proxyDomain || 'kbox.site'
      },
      labels: {
        'io.lando.container': 'TRUE'
      },
      ports: [
        [lando.config.engineHost, http, '80'].join(':'),
        [lando.config.engineHost, https, '443'].join(':'),
        [lando.config.engineHost, redis, '8160'].join(':')
      ],
      restart: 'always'
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

      // Add entries to redis for hipache
      app.events.on('post-start', 1, function() {

        // Grab the proxy config
        var proxyServices = app.proxy || {};

        // Go through those services one by one and add dns entries
        return Promise.map(proxyServices, function(service) {

          // Return the services for this app
          var getAppService = function(service) {
            return {
              compose: _.uniq(app.compose),
              project: app.name,
              opts: {
                app: app,
                services: [service]
              }
            };
          };

          // Log the service getting confed
          lando.log.verbose('Configuring DNS for %s service.', service.name);

          // Inspect the service to be proxies
          return lando.engine.inspect(getAppService(service.name))

          // Grab our port information from docker
          .then(function(data) {

            // Get port information from container query.
            var ip = _.get(data, 'NetworkSettings.Networks.bridge.IPAddress');

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
      app.events.on('app-info', function() {

        // Do we have a proxyfile already?
        var hasProxy = fs.existsSync(proxyFile);

        // Helper to determine whether proxy is up
        var proxyIsUp = function() {
          return Promise.try(function() {

            // If there is a proxy file, grab it and inspect
            if (hasProxy) {

              // Try to inspect the proxy
              return lando.engine.inspect(getProxy(proxyFile))

              // Determine whether it is running or not
              .then(function(data) {

                // We dont have a container at all
                if (!data) {
                  return false;
                }

                // Othewise data and check running status
                cache.set('proxyData', data);
                return lando.engine.isRunning(data.Id);

              });

            }

            // This must be false
            else {
              return false;
            }

          });
        };

        // Kick off the chain by seeing if our things are up
        return Promise.all([
          proxyIsUp(),
          lando.app.isRunning(app.name)
        ])

        // Check to see if our proxy is running, if not, start it
        .then(function(isRunning) {

          // Return our service status
          var proxyIsUp = isRunning[0];
          var appIsUp = isRunning[1];

          // Log
          lando.log.verbose('Proxy up = %s', proxyIsUp);
          lando.log.verbose('App %s is up = %s', app.name, proxyIsUp);

          // Kick off another chain
          return Promise.try(function() {

            // If proxy is down up app is up try to start the proxy
            if (appIsUp && !proxyIsUp) {

              // Log
              lando.log.verbose('App %s is up but proxy is down', app.name);

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

              // Configure the proxy and start the service
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

                // Log
                var engineHost = lando.config.engineHost;
                lando.log.verbose('Proxying on %s:%s', engineHost, http);
                lando.log.verbose('Proxying on %s:%s', engineHost, https);
                lando.log.verbose('Proxy redis on %s:%s', engineHost, redis);

                // Get the proxy service
                var proxyService = {proxy: getProxyService(http, https, redis)};

                // Set the service
                lando.utils.compose(proxyFile, proxyService);

                // Start the service and dump our cache
                cache.remove('proxyData');
                return lando.engine.start(getProxy(proxyFile));

              });

            }

          })

          // Inspect if our app is up
          .then(function() {
            if (appIsUp) {
              var data = cache.get('proxyData');
              return (data) ? data : lando.engine.inspect(getProxy(proxyFile));
            }
          })

          // Grab the ports we are using and then parse the services if our app
          // is Up
          .then(function(data) {

            if (appIsUp) {

              // Core data path
              var pp = function(port) {
                return 'NetworkSettings.Ports.' + port + '/tcp[0].HostPort';
              };

              // Get our ports from the daat
              var preferredHttp = lando.config.proxyHttpPort;
              var preferredHttps = lando.config.proxyHttpsPort;
              var httpPort = _.get(data, pp('80'), preferredHttp);
              var httpsPort = _.get(data, pp('443'), preferredHttps);
              var ports = {http: httpPort, https: httpsPort};

              // Add the parsed services to the app
              app.proxy = parseServices(app, ports);

              // Add URLS to the app info if applicable
              _.forEach(app.proxy, function(service) {
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

      });

    }

  });

};
