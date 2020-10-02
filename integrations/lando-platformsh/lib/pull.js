'use strict';

// Modules
const _ = require('lodash');
const {getAuthOptions} = require('./auth');

// The non dynamic base of the task
const task = (service, closestApp) => ({
  service,
  description: 'Pull relationships and/or mounts from platform.sh',
  cmd: '/helpers/psh-pull.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
  options: {
    auth: {
      describe: 'Platform.sh API token',
      passthrough: true,
      string: true,
      interactive: {
        type: 'list',
        message: 'Choose a Platform.sh account',
        choices: [],
        when: () => false,
        weight: 100,
      },
    },
    relationship: {
      description: 'A relationship to import',
      passthrough: true,
      alias: ['r'],
      array: true,
      interactive: {
        type: 'checkbox',
        message: 'Choose relationships to import from platformsh',
        choices: () => {
          return _.keys(closestApp.relationships);
        },
        when: () => !_.isEmpty(closestApp.relationships),
        weight: 100,
      },
    },
    mount: {
      description: 'A mount to download',
      passthrough: true,
      alias: ['m'],
      array: true,
      interactive: {
        type: 'checkbox',
        message: 'Choose mounts to download from platformsh',
        choices: () => {
          return _.keys(closestApp.mounts);
        },
        when: () => !_.isEmpty(closestApp.mounts),
        weight: 100,
      },
    },
  },
});

/*
 * Helper to build a pull command
 */
exports.getPlatformPull = (service, {meta, platformsh}) => {
  return _.merge({}, task(service, platformsh.closestApp), {options: getAuthOptions(meta, platformsh.tokens)});
};
