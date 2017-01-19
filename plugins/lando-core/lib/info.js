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

      // Inspect the container
      return lando.engine.inspect(container)

      // Grab our port data
      .then(function(data) {

        // Get our external ports
        var ports = data.NetworkSettings.Ports || [];

        // Loop through ports and add a URL if possible
        _.forEach(ports, function(externalPorts, port) {

          // If internal port is 80
          if (port === '80/tcp' || port === '443/tcp') {

            // Protocol
            var protocol = (port === '80/tcp') ? 'http://' : 'https://';

            // Add URL
            _.forEach(externalPorts, function(externalPort) {
              urls.push(protocol + 'localhost:' + externalPort.HostPort);
            });
          }

        });

      })

      // Add our URLs
      .then(function() {
        app.info[container.service].urls = urls;
      });

    });

  };

  // Add in some high level config so our app can handle
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Adds an object to collect helpful info about the app
    app.info = {};

    // Add some basics to the info and emit and event so other things
    // can add info as well
    app.events.on('app-ready', 9, function() {

      // Add service keys
      _.forEach(_.keys(app.containers), function(service) {
        app.info[service] = {};
      });

      // Get the URLs for this app
      return getUrls(app)

      // Allow other things to add info
      .then(function() {
        return app.events.emit('app-info', app);
      });

    });

    // The apps urls need to be refreshed on start since these can
    // change during the process eg on restart
    app.events.on('post-start', 1, function() {
      return getUrls(app);
    });

  });

};
