'use strict';

// Modules
const _ = require('lodash');
const auth = require('./auth');
const utils = require('./utils');

// The non dynamic base of the task
const task = {
  service: 'appserver',
  description: 'Pull code, database and/or files from Pantheon',
  cmd: '/helpers/pull.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
  options: {
    auth: {
      describe: 'Pantheon machine token',
      passthrough: true,
      string: true,
      interactive: {
        type: 'list',
        message: 'Choose a Pantheon account',
        choices: [],
        when: () => false,
        weight: 100,
      },
    },
    code: {
      description: 'The environment from which to pull the code',
      passthrough: true,
      alias: ['c'],
      interactive: {
        type: 'list',
        message: 'Pull code from?',
        weight: 600,
      },
    },
    database: {
      description: 'The environment from which to pull the database',
      passthrough: true,
      alias: ['d'],
      interactive: {
        type: 'list',
        message: 'Pull database from?',
        weight: 601,
      },
    },
    files: {
      description: 'The environment from which to pull the files',
      passthrough: true,
      alias: ['f'],
      interactive: {
        type: 'list',
        message: 'Pull files from?',
        weight: 602,
      },
    },
    rsync: {
      description: 'Rsync the files, good for subsequent pulls',
      passthrough: true,
      boolean: true,
      default: false,
    },
  },
};

// Helper to populate interactive opts
const getDefaults = (task, options) => {
  _.forEach(['code', 'database', 'files'], name => {
    task.options[name].interactive.choices = answers => {
      return utils.getPantheonInquirerEnvs(
      answers.auth,
      options.id,
      [],
      options._app.log);
    };
    task.options[name].interactive.default = options.env;
  });
  return task;
};

/*
 * Helper to build a pull command
 */
exports.getPantheonPull = (options, tokens = []) => {
  return _.merge({}, getDefaults(task, options), {options: auth.getAuthOptions(options._app.meta, tokens)});
};
