'use strict';

// Modules
const _ = require('lodash');
const API = require('./api');
const auth = require('./auth');
const utils = require('./utils');

// The non dynamic base of the task
const task = {
  service: 'appserver',
  description: 'Pull code, database and/or files from Acquia',
  cmd: '/helpers/acquia-pull.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
  options: {
    // @TODO: We think we can remove this.
    auth: {
      describe: 'Acquia API token',
      passthrough: true,
      string: true,
      interactive: {
        type: 'list',
        message: 'Choose an Acquia account',
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
        choices: ['dev', 'test', 'none'],
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
        choices: ['dev', 'test', 'none'],
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
        choices: ['dev', 'test', 'none'],
        weight: 602,
      },
    },
  },
};
// @TODO: MM is going to put the remote site alias data on the 
//   app or lando object so we can get it here.
//   grab the siteId from utils.getAcliUuid()
const uuid = utils.getAcliUuid();
console.log('uuid', uuid);
// const envs = utils.getAcquiaToken();
// const api = new API();
// // @TODO: helper function to get key/secret is MM forthcoming.
// const key = 'df44ff34-3e63-4373-8028-b2d6a3c52885';
// const secret = 'fFOr6MlQOWb+8Y4N2z995J780JAu8vq3TsJm01OS73I=';
// const envUuids = api.getEnvironments(uuid);
// const envs = api.auth(key, secret)
//   .then(() => (api.getEnvironments(uuid)));
// console.log(envs);
const buildCodePullCommand = 'acli pull:code';
const buildDbPullCommand = 'acli pull:db';
const buildFilesPullCommand = 'acli pull:files';

// Helper to populate defaults
const getDefaults = (task, options) => {
  // console.log(options._app._lando.config.home);
  const home = options._app._lando.config.home;
  const envs = utils.getAcquiaToken('/var/www');
  console.log(envs);
  // Set envvars
  task.env = {
    ACLI_SITE: uuid,
    LANDO_CODE_PULL_COMMAND: buildCodePullCommand,
    LANDO_DB_PULL_COMMAND: buildDbPullCommand,
    LANDO_DB_USER_TABLE: 'users',
    LANDO_FILES_PULL_COMMAND: buildFilesPullCommand,
    // @TODO: Do we need this? pantheon and lagoon have it, platform 
    //   does not have it.
    // LANDO_LEIA: _.toInteger(options._app._config.leia),
  };

  return task;
};

/*
 * Helper to build a pull command
 */
exports.getAcquiaPull = (options, tokens = []) => {
  return _.merge({}, getDefaults(task, options));
};
