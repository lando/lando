'use strict';

// Modules
const _ = require('lodash');
const utils = require('./utils');

// Vars
const choices = utils.getEnvUuids();

// The non dynamic base of the task
const task = {
  service: 'appserver',
  description: 'Push code, database and/or files to Acquia',
  cmd: '/helpers/acquia-push.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
  options: {
    code: {
      description: 'The environment to which the code will be pushed',
      passthrough: true,
      alias: ['c'],
      interactive: {
        type: 'list',
        message: 'Push code to?',
        choices: choices,
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
        choices: choices,
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
        choices: choices,
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
  _.forEach(choices, name => {
    // task.options[name].interactive.choices = answers => {
    //   return utils.getAcquiaInquirerEnvs(
    //   answers.auth,
    //   options.id,
    //   ['test', 'live'],
    //   options._app.log);
    // };
    if (name === 'code') task.options[name].interactive.default = options.env;
  });
  return task;
};

/*
 * Helper to build a pull command
 */
exports.getAcquiaPush = (options, tokens = []) => {
  return _.merge({}, getDefaults(task, options));
};
