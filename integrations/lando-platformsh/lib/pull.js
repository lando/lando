'use strict';

// Modules
const _ = require('lodash');
const {getAuthOptions} = require('./auth');

// The non dynamic base of the task
const task = service => ({
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
    },
    mount: {
      description: 'A mount to download',
      passthrough: true,
      alias: ['m'],
      array: true,
    },
  },
});

/*
 * Helper to build a pull command
 */
exports.getPlatformPull = (service, {meta, platformsh}) => {
  return _.merge({}, task(service), {options: getAuthOptions(meta, platformsh.tokens)});
};
