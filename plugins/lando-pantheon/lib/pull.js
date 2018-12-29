'use strict';

// Modules
const _ = require('lodash');
const PantheonApiClient = require('./client');
const api = new PantheonApiClient();

const getEnvs = (id, done, nopes = []) => {

  // Get the pantheon sites using the token
  api.auth('UyXAwO85FCtifY1pxUEbvxVsNi7iVeunVepY_Dc1n8Twc').then(authorizedApi => authorizedApi.getSiteEnvs(id))

  // Parse the evns into choices
  .map(env => ({name: env.id, value: env.id}))

  // Filter out any restricted envs
  .filter(env => !_.includes(nopes, env.value))

  // Done
  .then(envs => {
    console.log(envs)
    envs.push({name: 'none', value: 'none'});
    done(null, envs);
  });
};
/*
 * Helper to build a pull command
 */
exports.getPantheonPull = options => ({
  service: 'appserver',
  description: 'Pull code, database and/or files from Pantheon',
  cmd: '/helpers/pull.sh',
  level: 'app',
  options: {
    code: {
      description: 'The environment to get the code from or [none]',
      passthrough: true,
      alias: ['c'],
      interactive: {
        type: 'list',
        message: 'Pull code from?',
        choices: function() {
          console.log('pulling')
          getEnvs(options.id, this.async());
        },
        default: options.env,
        weight: 600,
      },
    },
    database: {
      description: 'The environment to get the db from or [none]',
      passthrough: true,
      alias: ['d'],
      interactive: {
        type: 'list',
        message: 'Pull DB from?',
        choices: function() {
          getEnvs(this.async());
        },
        default: options.env,
        weight: 601,
      },
    },
    files: {
      description: 'The environment to get the files from or [none]',
      passthrough: true,
      alias: ['f'],
      interactive: {
        type: 'list',
        message: 'Pull files from?',
        choices: function() {
          getEnvs(this.async());
        },
        default: options.env,
        weight: 602,
      },
    },
    rsync: {
      description: 'Rsync the files, good for subsequent pulls',
      passthrough: true,
      boolean: true,
      default: false,
    },
  },
});
