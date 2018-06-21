'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;

  // Add tooling module to lando
  lando.events.on('post-bootstrap', 2, lando => {
    // Log
    lando.log.info('Initializing tooling plugin');
    // Add the SSH command
    lando.tasks.add('ssh', require('./tasks/ssh')(lando));
    // Add services to lando
    lando.tooling = require('./tooling')(lando);
  });

  // Try to detect additional commands if we are in the CLI and have app context
  lando.events.on('pre-cli-load', tasks => {
    // Try to determine app context so we can load in any tooling commands that
    // are defined there
    return lando.app.get()

    // If we have an app with a tooling section let's do this
    .then(app => {
      if (app && app.config.tooling && !_.isEmpty(app.config.tooling)) {
        // Log
        lando.log.verbose('Additional tooling detected for app %s', app.name);
        // Loop through each tool
        _.forEach(app.config.tooling, (task, name) => {
          if (_.isObject(task)) {
            // Log
            lando.log.verbose('Adding app cli task %s', name);
            // Build our config
            const config = task;
            task.app = app;
            task.name = name;
            // Build and add the task
            tasks.push(lando.tooling.build(config));
          }
        });

        // Log.
        lando.log.verbose('App tooling loaded.');
      }
    });
  });
};
