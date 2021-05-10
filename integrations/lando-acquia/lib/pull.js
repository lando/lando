'use strict';

// Modules
const _ = require('lodash');
const auth = require('./auth');
const API = require('./api');
const {getBestEnv} = require('./utils');

// Acquia
const api = new API();
let acquiaEnvs = [];

/*
 * Helper to get envs
 */
const getEnvs = (key, secret, uuid) => {
  // If we already have it, return it
  if (!_.isEmpty(acquiaEnvs)) return acquiaEnvs;

  // Otherwise fetch them
  return api.auth(key, secret, true, true)
    .then(() => api.getEnvironments(uuid))
    .then(envs => _(envs)
      .map(env => _.merge({}, env, {name: env.displayName, value: env.name}))
      .value()
    )
    .then(envs => {
      acquiaEnvs = envs;
      acquiaEnvs.push({'name': 'none', 'value': 'none'});
      return envs;
    });
};

// The non dynamic base of the task
const task = {
  service: 'appserver',
  description: 'Pull code, database and/or files from Acquia',
  cmd: '/helpers/acquia-pull.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
  options: {
    key: {
      describe: 'An Acquia API key',
      passthrough: true,
      string: true,
      interactive: {
        type: 'list',
        message: 'Choose an Acquia key',
        choices: [],
        when: () => false,
        weight: 100,
      },
    },
    secret: {
      describe: 'An Acquia API secret',
      passthrough: true,
      password: true,
    },
    code: {
      description: 'The environment from which to pull the code',
      passthrough: true,
      alias: ['c'],
      interactive: {
        type: 'list',
        message: 'Pull code from?',
        weight: 200,
      },
    },
    database: {
      description: 'The environment from which to pull the database',
      passthrough: true,
      alias: ['d'],
      interactive: {
        type: 'list',
        message: 'Pull database from?',
        weight: 300,
      },
    },
    files: {
      description: 'The environment from which to pull the files',
      passthrough: true,
      alias: ['f'],
      interactive: {
        type: 'list',
        message: 'Pull files from?',
        weight: 400,
      },
    },
  },
};

// Helper to populate defaults
const getDefaults = (task, options) => {
  // Set interactive options
  const {key, secret, appUuid} = options;
  _.forEach(['code', 'database', 'files'], name => {
    task.options[name].interactive.choices = answers => {
      // Break up auth into parts
      const authParts = answers['key'].split(':');
      // If we have two parts then we need to separate, otherwise we assume
      // secret and key were passed in separately
      if (authParts.length === 2) {
        answers['key'] = authParts[0];
        answers['secret'] = authParts[1];
      }
      // Use the inputed creds, otherwise fallback
      const bestKey = _.get(answers, 'key', key);
      const bestSecret = _.get(answers, 'secret', secret);
      // Get ENVS
      return getEnvs(bestKey, bestSecret, appUuid);
    };
    // Dev seems like the safest default for pull
    task.options[name].interactive.default = getBestEnv(acquiaEnvs);
  });

  // Set the task env
  task.env = {LANDO_DB_USER_TABLE: 'users'};

  // Return
  return task;
};

/*
 * Helper to build a pull command
 */
exports.getAcquiaPull = (options, keys = []) => {
  const {key, secret, account} = options;
  return _.merge({}, getDefaults(task, options), {options: auth.getAuthOptions(key, secret, account, keys)});
};
