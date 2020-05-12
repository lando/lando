'use strict';

// Modules
const _ = require('lodash');
const auth = require('./auth');
const utils = require('./utils');

// The non dynamic base of the task
const task = {
  service: 'appserver',
  description: 'Push code, database and/or files to Pantheon',
  cmd: '/helpers/push.sh',
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
      description: 'The environment to which the code will be pushed',
      passthrough: true,
      alias: ['c'],
      interactive: {
        type: 'list',
        message: 'Push code to?',
        weight: 600,
      },
    },
    database: {
      description: 'The environment to which the database will be pushed',
      passthrough: true,
      alias: ['d'],
      interactive: {
        default: 'none',
        type: 'list',
        message: 'Push database to?',
        weight: 610,
      },
    },
    files: {
      description: 'The environment to which the files will be pushed',
      passthrough: true,
      alias: ['f'],
      interactive: {
        default: 'none',
        type: 'list',
        message: 'Push files to?',
        weight: 620,
      },
    },
    message: {
      description: 'A message describing your change',
      passthrough: true,
      alias: ['m'],
      interactive: {
        type: 'string',
        message: 'What did you change?',
        default: 'My awesome Lando-based changes',
        weight: 630,
        when: answers => answers.code !== 'none',
      },
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
      ['test', 'live'],
      options._app.log);
    };
    if (name === 'code') task.options[name].interactive.default = options.env;
  });
  return task;
};

/*
 * Helper to build a pull command
 */
exports.getPantheonPush = (options, tokens = []) => {
  return _.merge({}, getDefaults(task, options), {options: auth.getAuthOptions(options._app.meta, tokens)});
};
