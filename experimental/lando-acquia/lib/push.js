'use strict';

const _ = require('lodash');
const auth = require('./auth');
const api = auth.api;

let acquiaEnvs = [];

const getAutoCompleteEnvs = (answers, lando, input = null) => {
  if (!_.isEmpty(acquiaEnvs)) {
    return lando.Promise.resolve(!input ? acquiaEnvs : acquiaEnvs.filter(app => _.startsWith(app.name, input)));
  }
  return api.getEnvironments(answers['acquia-app']).then(envs => {
    if (envs && Array.isArray(envs)) {
      acquiaEnvs = envs.map(item => (_.merge({name: item.name, value: item.id}, item)));
      acquiaEnvs.push({'name': 'none', 'value': 'none'});
      return acquiaEnvs;
    }
  });
};

const getInteractiveOptions = (lando, appId) => {
  let options = {
    code: {
      description: 'The environment to which the local code will be pushed',
      passthrough: true,
      alias: ['c'],
      interactive: {
        type: 'autocomplete',
        message: 'Pull code from?',
        source: (answers, input) => {
          return getAutoCompleteEnvs(answers, lando, input);
        },
        when: true,
        weight: 600,
      },
    },
    database: {
      description: 'The environment to which the local database will be pushed',
      passthrough: true,
      alias: ['d'],
      interactive: {
        type: 'autocomplete',
        message: 'Pull database from?',
        source: (answers, input) => {
          return getAutoCompleteEnvs(answers, lando, input);
        },
        when: true,
        weight: 601,
      },
    },
    files: {
      description: 'The environment to which local files will be pushed',
      passthrough: true,
      alias: ['f'],
      interactive: {
        type: 'autocomplete',
        message: 'Pull files from?',
        source: (answers, input) => {
          return getAutoCompleteEnvs(answers, lando, input);
        },
        validate: (input, answers) => {
          // Not really validating, just working within inquirer's confines to execute code here.
          // Strip out key and secret if they were already authenticated by the acli config.
          if (answers['authenticated']) {
            delete answers['acquia-key'];
            delete answers['acauia-secret'];
          }
        },
        when: true,
        weight: 602,
      },
    },
  };
  options = _.merge(options, auth.getInteractiveOptions(lando, appId));

  return options;
};

// The non dynamic base of the task
const task = {
  service: 'appserver',
  description: 'Push code, database and/or files to Acquia',
  cmd: '/helpers/acquia-push.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
};

const buildCodePushCommand = 'acli push:code';
const buildDbPushCommand = 'acli push:db';
const buildFilesPushCommand = 'acli push:files';

const getDefaults = (task, options) => {
  task.env = {
    LANDO_CODE_PULL_COMMAND: buildCodePushCommand,
    LANDO_DB_PULL_COMMAND: buildDbPushCommand,
    LANDO_DB_USER_TABLE: 'users',
    LANDO_FILES_PULL_COMMAND: buildFilesPushCommand,
  };
  const lando = options._app._lando;
  const appConfig = options._app.config;
  task.options = getInteractiveOptions(lando, appConfig);
  return task;
};

exports.getAcquiaPush = (options, tokens = []) => {
  return getDefaults(task, options);
};
