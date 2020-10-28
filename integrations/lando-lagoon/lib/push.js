'use strict';

// Modules
const _ = require('lodash');
const api = require('./api');
const keys = require('./keys');

const getEnvironmentChoices = (keyId, lando, projectName) => {
  return api.getLagoonApi(keyId, lando)
    .getEnvironments(projectName)
    .then(environments => {
      return _(environments)
        .map(env => ({name: env.name, value: env.openshiftProjectName}))
        .concat([{name: 'Do not push', value: 'none'}])
        .value();
    });
};

// The non dynamic base of the task
const defaultTask = options => ({
  service: 'cli',
  description: 'Pull db and files from Lagoon',
  cmd: '/helpers/lagoon-push.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
  options: {
    auth: {
      describe: 'Lagoon instance',
      passthrough: true,
      string: true,
      interactive: {
        type: 'list',
        choices: keys.getKeyChoices(options._app._lando),
        message: 'Select a Lagoon account',
        when: () => !_.isEmpty(keys.getCachedKeys(options._app._lando)),
        weight: 600,
      },
    },
    database: {
      description: 'The remote environment to push the database to',
      passthrough: true,
      alias: ['d'],
      interactive: {
        type: 'list',
        choices: (answers, input) => {
          return getEnvironmentChoices(answers['auth'], options._app._lando, options._app.name);
        },
        message: 'Push local database to?',
        weight: 601,
      },
    },
    files: {
      description: 'The remote environment to push local files to',
      passthrough: true,
      alias: ['f'],
      interactive: {
        type: 'list',
        choices: (answers, input) => {
          return getEnvironmentChoices(answers['auth'], options._app._lando, options._app.name);
        },
        message: 'Push local files to?',
        weight: 602,
      },
    },
  },
});

/*
 * Helper to build a pull command
 */
exports.getPush = options => {
  return _.merge({}, defaultTask(options));
};
