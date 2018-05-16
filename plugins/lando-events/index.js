'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Add tooling module to lando
  lando.events.on('post-bootstrap', 2, function(lando) {
    lando.log.info('Initializing events');
  });

  // Do all the services magix
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Check to see if we have any event definitions in our .lando.yml and then
    // queue them up for running
    if (!_.isEmpty(app.config.events)) {
      _.forEach(app.config.events, function(cmds, name) {

        // Go through the events
        app.events.on(name, function(data) {

          // Build collector
          var build = [];

          // Add to the build
          _.forEach(cmds, function(cmd) {

            // Start with service assumptions
            var service = _.get(data, 'service', 'appserver');

            // Get the service name if cmd is an object
            if (typeof cmd === 'object') {
              service = Object.keys(cmd)[0];
              cmd = cmd[Object.keys(cmd)[0]];
            }

            // Validate the service
            if (!_.includes(_.keys(app.services), service)) {
              throw new Error('This app has no service called %s', service);
            }

            // Build the container
            var container = [app.name, service, '1'].join('_');

            // Add the build command
            build.push({
              id: container,
              cmd: cmd,
              compose: app.compose,
              project: app.name,
              opts: {
                app: app,
                mode: 'attach',
                user: 'www-data',
                services: [service]
              }
            });

          });

          // Run the custom commands
          return lando.engine.run(build);

        });
      });

    }

  });


};
