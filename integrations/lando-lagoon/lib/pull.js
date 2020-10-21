'use strict';

// Modules
const _ = require('lodash');
const api = require('./api');
const utils = require('./utils');

const getEnvironmentChoices = (keyId, lando, projectName) => {
  return api.getLagoonApi(keyId, lando)
    .getEnvironments(projectName)
    .then(environments => {
      return environments.map(env => ({name: env.name, value: env.name}));
    });
};

// The non dynamic base of the task
const defaultTask = options => ({
  service: 'cli',
  description: 'Pull db and files from Lagoon',
  cmd: '/helpers/lagoon-pull.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
  env: {
    LANDO_DB_HOST: 'mariadb',
    LANDO_DB_USER: 'drupal',
    LANDO_DB_PASS: 'drupal',
    LANDO_DB_NAME: 'drupal',
    LAGOON_PROJECT: options._app.name,
  },
  options: {
    auth: {
      describe: 'Lagoon instance',
      passthrough: true,
      string: true,
      interactive: {
        type: 'list',
        choices: utils.getKeyChoices(options._app._lando),
        message: 'Select a Lagoon account',
        when: answers => !_.isEmpty(options._app._lando.cache.get(utils.keyCacheId)),
        weight: 600,
      },
    },
    environment: {
      description: 'The environment from which to sync the database from',
      passthrough: true,
      alias: ['e'],
      interactive: {
        type: 'list',
        choices: (answers, input) => {
          return getEnvironmentChoices(answers['auth'], options._app._lando, options._app.name).then(sites => {
            return _.orderBy(sites, ['name']);
          });
        },
        message: 'Pull database from?',
        weight: 601,
      },
    },
    database: {
      description: 'Whether to pull database',
      passthrough: true,
      alias: ['db'],
      interactive: {
        type: 'list',
        choices: [{name: 'No', value: 'no'}, {name: 'Yes', value: 'yes'}],
        message: 'Pull database?',
        weight: 610,
      },
    },
    files: {
      description: 'Whether to pull database',
      passthrough: true,
      alias: ['f'],
      interactive: {
        type: 'list',
        choices: [{name: 'No', value: 'no'}, {name: 'Yes', value: 'yes'}],
        message: 'Pull database?',
        weight: 620,
      },
    },
  },
});

/*
 * Helper to build a pull command
 */
exports.getPull = options => {
  //return [defaultTask(options)];
  return _.merge({}, defaultTask(options));
};
