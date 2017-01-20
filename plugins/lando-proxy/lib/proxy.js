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

  // Turn the proxy off on powerdown
  lando.events.on('poweroff', function() {
    return lando.engine.stop(getProxy(proxyFile));
  });

  // Turn on the proxy before the app starts and then add a record to it
  lando.events.on('post-instantiate-app', function(app) {
    app.events.on('post-start', 1, function() {

      // Do we have a proxyfile already?
      var hasProxy = fs.existsSync(proxyFile);

      // Kick off the chain
      return Promise.try(function() {

        // If there is a proxy file, grab it and inspect
        if (hasProxy) {
          return lando.engine.inspect(getProxy(proxyFile))
          .then(function(data) {
            return lando.engine.isRunning(data.Id);
          });
        }

        // This must be false
        else {
          return false;
        }

      })

      // Check to see if our proxy is running, if not, start it
      .then(function(isRunning) {
        if (!isRunning) {

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
      });

    });
  });

};
