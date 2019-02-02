'use strict';

// Modules
const _ = require('lodash');
const utils = require('./utils');

/*
 * Helper to build tasks from metadata
 */
module.exports = (config, lando) => {
  // Get our defaults and such
  const {name, app, cmd, describe, options, service, user} = utils.toolingDefaults(config);
  // Handle dynamic services and passthrough options right away
  // Get the run handler
  const run = answers => lando.Promise.try(() => (_.isEmpty(app.compose)) ? app.init() : true)
    // Kick off the pre event wrappers
    .then(() => app.events.emit(`pre-${name}`, config))
    // Get an interable of our commandz
    .then(() => _.map(utils.parseConfig(cmd, service, options, answers)))
    // Build run objects
    .map(({command, service}) => utils.buildCommand(app, command, service, user))
    // Try to run the task quickly first and then fallback to compose launch
    .each(runner => {
      return lando.engine.isRunning(runner.id)
      .then(isRunning => {
        if (isRunning) return utils.dockerExec(lando, runner);
        else return lando.engine.run(runner);
      })
      .catch(error => {
        error.hide = true;
        throw error;
      });
    })
    // Post event
    .then(() => app.events.emit(`post-${name}`, config));

  // Return our tasks
  return {
    command: name,
    describe,
    run: run,
    options: options,
  };
};
