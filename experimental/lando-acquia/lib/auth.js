'use strict';

// Modules
const _ = require('lodash');
const utils = require('./utils');

// Helper to get pantheon auth non-interactive options
const getInteractiveOptions = (keys = []) => ({
  'key': {
    interactive: {
      choices: utils.getKeys(keys),
      when: answers => !_.isEmpty(keys),
      weight: 100,
    },
  },
  'key-entry': {
    hidden: true,
    interactive: {
      name: 'key',
      type: 'input',
      message: 'Enter an Acquia API key',
      when: answers => _.isEmpty(keys) || answers.key === 'more',
      validate: (input, answers) => {
        // If we end up here we likely need to ask for the secret as well
        if (answers['key'] === 'more') answers['needs-secret-entry'] = true;

        // @NOTE: this exists mostly to stealth add acquia-needs-secret-entry
        // but @TODO could actually validate the key as well
        return true;
      },
      weight: 110,
    },
  },
  'secret': {
    interactive: {
      type: 'password',
      message: 'Enter an Acquia API secret',
      when: answers => {
        // If we are manually entering another key/secret pair
        if (answers['needs-secret-entry']) return answers['needs-secret-entry'];

        // Otherwise we only want to show this in a partial options pass in
        // eg lando init --source acquia --acquia-key my-key
        const authParts = answers['key'].split(':');
        if (authParts.length === 1) return true;

        // Otherwise i dont think we need to show this
        return false;
      },
      weight: 120,
    },
  },
});

// Helper to get pantheon auth non-interactive options
const getNonInteractiveOptions = (key, secret, email) => ({
  'key': {
    default: key,
    defaultDescription: email,
  },
  'secret': {
    default: secret,
    defaultDescription: '***',
  },
});

/*
 * Helper to build a pull command
 */
exports.getAuthOptions = (key = false, secret = false, label = false, keys = []) => {
  if (key && secret) return getNonInteractiveOptions(key, secret, label);
  else return getInteractiveOptions(keys);
};
