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

  // Fixed location of our proxy service compose file
  var proxyDir = path.join(lando.config.userConfRoot, 'proxy');
  var proxyFile = path.join(proxyDir, 'proxy' + '.yml');

  /*
   * Define the proxy service
   */
  var getProxyService = function(http, https, redis) {
    return {
      image: 'kalabox/proxy:stable',
      environment: {
        'DOMAIN': lando.config.proxyDomain || 'lando.site'
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
      var port;

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

      // Add proxy URLS to our app info
      app.events.on('app-info', function() {

        // Do we have a proxyfile already?
        var hasProxy = fs.existsSync(proxyFile);

        // Helper to determine whether proxy is up
        var proxyIsUp = function() {
          return Promise.try(function() {

            // If there is a proxy file, grab it and inspect
            if (hasProxy) {
              return lando.engine.inspect(getProxy(proxyFile))
              .then(function(data) {
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

          // Kick off another chain
          return Promise.try(function() {

            // If proxy is down up app is up try to start the proxy
            if (appIsUp && !proxyIsUp) {

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

                // Get the proxy service
                var proxyService = {proxy: getProxyService(http, https, redis)};

                // Set the service
                lando.utils.compose(proxyFile, proxyService);

                // Start the service
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

              // Add URLS to the app info
              _.forEach(app.proxy, function(service) {

                // Get old urls
                var old = app.info[service.name].urls || [];
                var updated = _.map(service.routes, 'urls');

                // Merge our list together
                app.info[service.name].urls = _.flatten(old.concat(updated));

              });

            }

          });

        });

      });

    }

  });

};
