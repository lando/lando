/**
 * This adds tooling settings to our config
 *
 * @name bootstrap
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Add tooling module to lando
  lando.events.on('post-bootstrap', 1, function(lando) {

    // Log
    lando.log.info('Initializing tooling');

    // Add the SSH command
    lando.tasks.add('ssh', require('./tasks/ssh')(lando));

    // Add services to lando
    lando.tooling = require('./tooling')(lando);

  });

  // Try to detect additional commands if we have app context
  lando.events.on('post-bootstrap', function(lando) {

    // Try to determine app context so we can load in any tooling commands that
    // are defined there
    return lando.app.get()

    // If we have an app with a tooling section let's do this
    .then(function(app) {
      if (app && app.config.tooling && !_.isEmpty(app.config.tooling)) {

        // Log
        lando.log.verbose('Additional tooling detected for app %s', app.name);

        // Loop through each tool
        _.forEach(app.config.tooling, function(task, name) {

          // Log
          lando.log.verbose('Adding app cli task %s', name);

          // Build our config
          var config = task;
          task.app = app;
          task.name = name;

          // Build and add the task
          lando.tasks.add(name, lando.tooling.build(config));

        });

        // Log.
        lando.log.verbose('App tooling loaded.');

      }
    });

  });

};
