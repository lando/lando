'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const utils = require('./lib/utils');

/*
 * Helper to build tasks from metadata
 */
const buildTask = (config, lando) => {
  const {name, app, cmd, description, needs, options, service, user} = utils.toolingDefaults(config);
  // Get the run handler
  const run = answers => {
    // Handle dynamic services right away
    const container = utils.getContainer(service, answers);
    // Normalize any needs we have
    const auxServices = (_.isString(needs)) ? [needs] : needs;
    // Get passthrough options
    const passOpts = utils.getPassthruOpts(options, answers);
    // Initilize our app here
    return app.init().then(() => {
      // Translate our command into something we can iterate over
      const tooling = _.map(utils.parseCommand(cmd, container, passOpts), ({command, container}) => {
        return utils.buildCommand(app, command, auxServices, container, user);
      });
      // Run a pre-event
      return utils.runCommands(name.split(' ')[0], app.events, lando.engine, tooling, config);
    });
  };

  // Return our tasks
  return {
    name: _.first(name.split(' ')),
    command: name,
    describe: description,
    run: run,
    options: options,
  };
};

module.exports = lando => {
  // Try to detect additional commands if we are in the CLI and have app context
  lando.events.on('pre-cli-load', tasks => {
    // Try to get our app
    const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile), false);
    // If we have an app with a tooling section let's do this
    if (app && !_.isEmpty(_.get(app, 'config.tooling', {}))) {
      lando.log.verbose('Additional tooling detected for app %s', app.name);
      // Add the tasks after we init the app
      _.forEach(utils.getToolingTasks(app.config.tooling, app), task => {
        lando.log.verbose('Adding app cli task %s', task.name);
        tasks.push(buildTask(task, lando));
      });
    }
  });
};
