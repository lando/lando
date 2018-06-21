'use strict';

// Modules
const _ = require('lodash');

module.exports = lando => {
  // Add tooling module to lando
  lando.events.on('post-bootstrap', 2, lando => {
    lando.log.info('Initializing tooling plugin');
    lando.tasks.add('ssh', require('./tasks/ssh')(lando));
    lando.tooling = require('./tooling')(lando);
  });

  // Try to detect additional commands if we are in the CLI and have app context
  lando.events.on('pre-cli-load', tasks => {
    // Try to determine app context so we can load in any tooling commands that
    // are defined there
    return lando.app.get()

    // If we have an app with a tooling section let's do this
    .then((app = {}) => {
      if (!_.isEmpty(_.get(app, 'config.tooling', {}))) {
        lando.log.verbose('Additional tooling detected for app %s', app.name);
        // Map into tasks
        const toolingTasks = _(app.config.tooling)
          .map((task, name) => _.merge({}, task, {app, name}))
          .filter(task => _.isObject(task))
          .value();

        // Add the tasks
        _.forEach(toolingTasks, task => {
          lando.log.verbose('Adding app cli task %s', task.name);
          tasks.push(lando.tooling.build(task));
        });

        // Log.
        lando.log.verbose('App tooling loaded.');
      }
    });
  });
};
