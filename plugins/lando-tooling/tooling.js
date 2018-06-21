'use strict';

const _ = require('lodash');
const utils = require('./lib/utils');

module.exports = lando => ({
  /**
   * Event that allows you to do some things before a tooling command is run
   *
   * @since 3.0.0
   * @event pre_COMMAND
   */
  /**
   * Event that allows you to do some things after a tooling command is run
   * @since 3.0.0
   * @event post_COMMAND
   */
  /**
   * The tooling command builder
   * @todo: this definitely needs work!
   *
   * @since 3.0.0
   * @alias lando.tooling.build
   * @fires pre_COMMAND
   * @fires post_COMMAND
   * @param {Object} config The build config
   * @return {Object} The build object
   */
  build: config => {
    const {name, app, cmd, description, needs, options, service, user} = utils.toolingDefaults(config);
    // Get the run handler
    const run = answers => {
      // Handle dynamic services right away
      const container = utils.getContainer(service, answers);
      // Normalize any needs we have
      const auxServices = (_.isString(needs)) ? [needs] : needs;
      // Get passthrough options
      const passOpts = utils.getPassthruOpts(options, answers);
      // Translate our command into something we can iterate over
      const tooling = _.map(utils.parseCommand(cmd, container, passOpts), ({command, container}) => {
        return utils.buildCommand(app, command, auxServices, container, user);
      });
      // Run a pre-event
      return utils.runCommands(name.split(' ')[0], app.events, lando.engine.run, tooling, config);
    };

    // Return our tasks
    return {
      name: _.first(name.split(' ')),
      command: name,
      describe: description,
      run: run,
      options: options,
    };
  },
});
