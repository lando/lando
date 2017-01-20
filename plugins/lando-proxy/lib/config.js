/**
 * This gets proxy config from our app
 *
 * @name config
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /*
   * Parse a proxy config object into an array of URLs
   */
  var getRouteUrls = function(route, name) {

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
      return protocol + hostname;
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
  var parseServices = function(app) {

    // Get the proxy config
    var config = app.config.proxy || {};

    // Transform our config into services objects
    var services = _.map(config, function(data, key) {

      // Map each route into an object of ports and urls
      var routes = _.map(data, function(route) {
        return {
          port: route.port,
          urls: getRouteUrls(route, app.name)
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

  // Figure out our proxy config
  lando.events.on('post-instantiate-app', function(app) {

    // If the proxy is on and our app has config
    if (lando.config.proxy === 'ON' && !_.isEmpty(app.config.proxy)) {

      // Add proxy URLS to our app info
      app.events.on('app-info', function() {

        // Add the parsed services to the app
        app.proxy = parseServices(app);

        // Add URLS to the app info
        _.forEach(app.proxy, function(service) {

          // Get old urls
          var oldUrls = app.info[service.name].urls || [];
          var newUrls = _.map(service.routes, 'urls');

          // Merge our list together
          app.info[service.name].urls = _.flatten(oldUrls.concat(newUrls));

        });
      });

    }

  });

};
