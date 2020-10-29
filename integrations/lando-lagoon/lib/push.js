'use strict';

// Modules
const _ = require('lodash');
const api = require('./api');
const keys = require('./keys');
const authDialogOptions = require('./auth-dialog-options');

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

// Build options object.
const getTaskOpts = options => {
  const lando = options._app._lando;
  const app = options._app;
  const opts = authDialogOptions(lando, false);

  // Add database environment selector.
  opts['database'] = {
    description: 'The remote environment to push the database to',
    passthrough: true,
    alias: ['d'],
    interactive: {
      type: 'list',
      choices: (answers, input) => {
        // Set key to current key if the key was generated during this run.
        if (keys.currentKey && keys.currentKey.id) {
          answers['lagoon-auth'] = keys.currentKey.id;
        }
        return getEnvironmentChoices(answers['lagoon-auth'], lando, app.name);
      },
      message: 'Push local database to?',
      weight: 601,
    },
  };

  // Add files environment selector.
  opts['files'] = {
    description: 'The remote environment to push local files to',
    passthrough: true,
    alias: ['f'],
    interactive: {
      type: 'list',
      choices: (answers, input) => {
        // Set key to current key if the key was generated during this run.
        if (keys.currentKey && keys.currentKey.id) {
          answers['lagoon-auth'] = keys.currentKey.id;
        }
        return getEnvironmentChoices(answers['lagoon-auth'], lando, app.name);
      },
      message: 'Push local files to?',
      weight: 602,
    },
  };

  return opts;
};

// The non dynamic base of the task
const defaultTask = options => ({
  service: 'cli',
  description: 'Pull db and files from Lagoon',
  cmd: '/helpers/lagoon-push.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
  options: getTaskOpts(options),
});

/*
 * Helper to build a pull command
 */
exports.getPush = options => {
  return _.merge({}, defaultTask(options));
};
