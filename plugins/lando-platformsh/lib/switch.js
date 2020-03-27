'use strict';

// Modules
const _ = require('lodash');
const auth = require('./auth');
const utils = require('./utils');

// The non dynamic base of the task
const task = {
  service: 'appserver',
  description: 'Switch to a different multidev environment',
  cmd: '/helpers/switch.sh',
  level: 'app',
  options: {
    'auth': {
      describe: 'Platformsh machine token',
      passthrough: true,
      string: true,
      interactive: {
        type: 'list',
        message: 'Choose a Platformsh account',
        choices: [],
        when: () => false,
        weight: 100,
      },
    },
    'env': {
      description: 'The environment to which we will swtich',
      passthrough: true,
      alias: ['e'],
      interactive: {
        type: 'list',
        message: 'Switch environment to?',
        weight: 610,
      },
    },
    'no-db': {
      description: 'Do not switch the database',
      boolean: true,
      default: false,
    },
    'no-files': {
      description: 'Do not switch the files',
      boolean: true,
      default: false,
    },

  },
};

// Helper to populate interactive opts
const getDefaults = (task, options) => {
  _.forEach(['env'], name => {
    task.options[name].interactive.choices = answers => {
      return utils.getPlatformshInquirerEnvs(
      answers.auth,
      options.id,
      ['test', 'live'],
      options._app.log);
    };
    task.options[name].interactive.default = options.env;
  });
  return task;
};

/*
 * Helper to build a pull command
 */
exports.getPlatformshSwitch = (options, tokens = []) => {
  return _.merge({}, getDefaults(task, options), {options: auth.getAuthOptions(options._app.meta, tokens)});
};
