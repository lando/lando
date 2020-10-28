'use strict';

// Modules
const _ = require('lodash');
const {getAuthOptions} = require('./auth');

// The non dynamic base of the task
const task = (service, closestApp) => ({
  service,
  description: 'Push relationships and/or mounts to platform.sh',
  cmd: '/helpers/psh-push.sh',
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
      description: 'A relationship to push up, use "none" to skip',
      passthrough: true,
      alias: ['r'],
      array: true,
      interactive: {
        type: 'checkbox',
        message: 'Choose relationships to push to platformsh',
        choices: () => {
          return _.keys(closestApp.syncableRelationships);
        },
        when: () => !_.isEmpty(closestApp.syncableRelationships),
        weight: 100,
      },
    },
    mount: {
      description: 'A mount to push up, use "none" to skip',
      passthrough: true,
      alias: ['m'],
      array: true,
      interactive: {
        type: 'checkbox',
        message: 'Choose mounts to push to platformsh',
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
exports.getPlatformPush = (service, {meta, platformsh}) => {
  return _.merge({}, task(service, platformsh.closestApp), {options: getAuthOptions(meta, platformsh.tokens)});
};
