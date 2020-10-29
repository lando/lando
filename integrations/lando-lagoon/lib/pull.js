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
        .concat([{name: 'Do not pull', value: 'none'}])
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
    description: 'The environment from which to sync the database from',
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
      message: 'Pull database from?',
      weight: 601,
    },
  };

  // Add files environment selector.
  opts['files'] = {
    description: 'The environment from which to sync files from',
    passthrough: true,
    alias: ['f'],
    interactive: {
      type: 'list',
      choices: (answers, input) => {
        return getEnvironmentChoices(answers['lagoon-auth'], lando, app.name);
      },
      message: 'Pull files from?',
      weight: 602,
    },
  };

  return opts;
};

// The non dynamic base of the task
const defaultTask = options => {
  return {
    service: 'cli',
    description: 'Pull db and files from Lagoon',
    cmd: '/helpers/lagoon-pull.sh',
    level: 'app',
    stdio: ['inherit', 'pipe', 'pipe'],
    options: getTaskOpts(options),
  };
};

/*
 * Helper to build a pull command
 */
exports.getPull = options => {
  return _.merge({}, defaultTask(options));
};
