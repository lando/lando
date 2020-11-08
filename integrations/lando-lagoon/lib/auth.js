'use strict';

// Modules
const _ = require('lodash');

// Helper to get pantheon auth non-interactive options
const getInteractiveOptions = (keys = []) => ({
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
      type: 'password',
      message: 'Enter a Lagoon key',
      when: answers => _.isEmpty(keys) || (_.get(answers, 'auth', '') === 'more'),
      weight: 101,
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
exports.getAuthOptions = ({email = false, key = false} = {}, keys = []) => {
  if (email && key) return getNonInteractiveOptions(key, email);
  else return getInteractiveOptions(keys);
};
