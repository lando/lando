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
      .filter(env => (env.name !== 'prod'))
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
  description: 'Push code, database and/or files to Acquia',
  cmd: '/helpers/acquia-push.sh',
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
      description: 'The environment to which the local code will be pushed',
      passthrough: true,
      alias: ['c'],
      interactive: {
        type: 'list',
        message: 'Push code to?',
        weight: 200,
      },
    },
    database: {
      description: 'The environment to which the local database will be pushed',
      passthrough: true,
      alias: ['d'],
      interactive: {
        type: 'list',
        message: 'Push database to?',
        weight: 300,
      },
    },
    files: {
      description: 'The environment to which local files will be pushed',
      passthrough: true,
      alias: ['f'],
      interactive: {
        type: 'list',
        message: 'Push files to?',
        weight: 400,
      },
    },
  },
};

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
    // None seems like the safest default for push
    task.options[name].interactive.default = 'none';
  });

  // Override the default so code puses to dev
  task.options.code.interactive.default = getBestEnv(acquiaEnvs);
  // Set the task env
  task.env = {LANDO_DB_USER_TABLE: 'users'};

  // Return
  return task;
};

exports.getAcquiaPush = (options, keys = []) => {
  const {key, secret, account} = options;
  return _.merge({}, getDefaults(task, options), {options: auth.getAuthOptions(key, secret, account, keys)});
};
