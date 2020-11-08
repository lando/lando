'use strict';

// Modules
const _ = require('lodash');
const os = require('os');
const path = require('path');

const {generateKey, getPreferredKey} = require('./keys');

const LagoonApi = require('./api');

// Helper to get pantheon auth non-interactive options
const getInteractiveOptions = (keys = [], lando = {}) => ({
  'auth': {
    interactive: {
      choices: keys,
      when: answers => !_.isEmpty(keys),
      weight: 100,
    },
  },
  // @TODO: below needs to get redone to handle the stranger lagoon auth flow
  'lagoon-key': {
    hidden: true,
    interactive: {
      name: 'auth',
      default: 'lagoon.amazeeio.cloud:32222',
      type: 'input',
      message: 'Copy/paste the SSH key above into the Lagoon UI; Enter the lagoon host and then press [Enter]',
      // Print the key for us to use
      when: answers => {
        // Figure out whether this is a new key workflow or not
        const show = _.size(keys) <= 1 || answers['auth'] === 'more';
        // Show the key as needed
        if (show) {
          return generateKey(lando).then(() => {
            return true;
          });
        } else {
          return false;
        }
      },
      // Validate the key and update the key with host/port
      validate: (input, answers) => {
        const key = path.join(os.homedir(), '.lando', 'keys', 'lagoon-pending');
        answers['auth'] = `${key}@${input}`;
        const api = new LagoonApi(getPreferredKey(answers), lando);
        return api.auth()
          .then(() => {
            // We set this here so we can pass it along separately
            answers['auth-generate'] = answers['auth'];
            // REturn true
            return true;
          })
          .catch(err => err);
      },
      weight: 520,
    },
  },
});

// Helper to get pantheon auth non-interactive options
const getNonInteractiveOptions = (key, email) => ({
  'auth': {
    default: key,
    defaultDescription: email,
  },
});

/*
 * Helper to build a pull command
 */
exports.getAuthOptions = ({email = false, key = false} = {}, keys = [], lando = {}) => {
  if (email && key) return getNonInteractiveOptions(key, email);
  else return getInteractiveOptions(keys, lando);
};
