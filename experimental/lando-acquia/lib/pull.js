'use strict';

// Modules
const _ = require('lodash');
const utils = require('./utils');

// Vars
const choices = utils.getEnvUuids();

// The non dynamic base of the task
const task = {
  service: 'appserver',
  description: 'Pull code, database and/or files from Acquia',
  cmd: '/helpers/acquia-pull.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
  options: {
    code: {
      description: 'The environment from which to pull the code',
      passthrough: true,
      alias: ['c'],
      interactive: {
        type: 'list',
        message: 'Pull code from?',
        choices: choices,
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
        choices: choices,
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
        choices: choices,
        weight: 602,
      },
    },
  },
};

const buildCodePullCommand = 'acli pull:code';
const buildDbPullCommand = 'acli pull:db';
const buildFilesPullCommand = 'acli pull:files';

// Helper to populate defaults
const getDefaults = (task, options) => {
  task.env = {
    LANDO_CODE_PULL_COMMAND: buildCodePullCommand,
    LANDO_DB_PULL_COMMAND: buildDbPullCommand,
    LANDO_DB_USER_TABLE: 'users',
    LANDO_FILES_PULL_COMMAND: buildFilesPullCommand,
  };

  return task;
};

/*
 * Helper to build a pull command
 */
exports.getAcquiaPull = (options, tokens = []) => {
  return _.merge({}, getDefaults(task, options));
};
