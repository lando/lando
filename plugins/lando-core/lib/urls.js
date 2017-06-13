/**
 * This adds info to an app and does some discovery on it
 *
 * Specifically, this will try to suss out relevant end user information such
 * as reachable urls, connection info, etc
 *
 * @name urls
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /*
   * Helper function to get URLs
   */
  var getUrls = function(app) {

    // Get list of containers
    return lando.engine.list(app.name)

    // Return running containers
    .filter(function(container) {
      return lando.engine.isRunning(container.id);
    })

    // Inspect each and add new URLS
    .map(function(container) {

      // Start a URL collector
      var urls = [];

      // Grab the service
      var service = container.service;

      // Inspect the container
      return lando.engine.inspect(container)

      // Grab our port data
      .then(function(data) {

        // Get our external ports
        var ports = data.NetworkSettings.Ports || [];

        // Loop through ports and add a URL if possible
        _.forEach(ports, function(externalPorts, port) {

          // Check to see if we have a port being forwarded and add it to the info
          if (_.get(app.config.services[service], 'portforward', false)) {
            var portPath = 'external_connection.port';
            _.set(app.info[service], portPath, externalPorts[0].HostPort);
          }

          // If internal port is 80
          if (port === '80/tcp' || port === '443/tcp') {

            // Protocol
            var protocol = (port === '80/tcp') ? 'http://' : 'https://';

            // Add URL
            _.forEach(externalPorts, function(externalPort) {
              var url = protocol + 'localhost:' + externalPort.HostPort;
              lando.log.debug('Adding %s to %s on %s.', url, service, app.name);
              urls.push(protocol + 'localhost:' + externalPort.HostPort);
            });
          }

        });

      })

      // Add our URLs
      .then(function() {
        if (app.info[container.service] && !_.isEmpty(urls)) {
          lando.log.verbose('%s service %s has urls:', app.name, service, urls);
          app.info[container.service].urls = urls;
        }
      });

    });

  };

  // Add in some high level config so our app can handle
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Add the services to the app
    app.events.on('app-ready', function() {

      // Add service keys
      _.forEach(_.keys(app.services), function(service) {
        app.info[service] = {};
      });

    });

    // Add the urls to the app
    app.events.on('pre-info', function() {
      return getUrls(app);
    });

    // The apps urls need to be refreshed on start since these can
    // change during the process eg on restart
    app.events.on('post-start', 1, function() {
      return getUrls(app);
    });

  });

};
