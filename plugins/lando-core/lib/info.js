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

  // Add in some high level config so our app can handle
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Adds an object to collect helpful info about the app
    app.info = {};

    // Add some basics to the info and emit and event so other things
    // can add info as well
    app.events.on('app-ready', 9, function(app) {

      // Add service keys
      _.forEach(_.keys(app.containers), function(service) {
        app.info[service] = {};
      });

      // Explore each service to extract URL info if possible
      _.forEach(app.info, function(data, service) {

        // Start a URL collector
        var urls = [];

        // Check if the service has exposed ports
        if (app.containers[service].ports) {

          // Get the ports
          var ports = app.containers[service].ports;

          // Loop through ports and add a URL if possible
          _.forEach(ports, function(port) {

            // Split the port if possible
            var parts = port.split(':');
            var internalPort;
            var externalPort;

            // If we have one part only then its the internal port
            if (parts.length === 1) {
              internalPort = parts[0];
              externalPort = 'TBD';
            }

            // Else first part is external
            else {
              internalPort = parts[1];
              externalPort = parts[0];
            }

            // If internal port is 80
            if (internalPort === '80') {
              urls.push('http://localhost:' + externalPort);
            }

            // If internal port is 443
            if (internalPort === '443') {
              urls.push('https://localhost:' + externalPort);
            }

          });

        }

        // Add the URLS
        app.info[service].urls = urls;

      });

      // Allow other things to add info
      return app.events.emit('app-info', app);

    });

  });

};
