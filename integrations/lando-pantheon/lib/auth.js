'use strict';

// Modules
const _ = require('lodash');

// Stuff
const getTokens = tokens => _(tokens).map(token => ({name: token.email, value: token.token})).value();

// Helper to get pantheon auth non-interactive options
const getInteractiveOptions = (tokens = []) => ({
  'auth': {
    interactive: {
      choices: _.flatten([getTokens(tokens), [{name: 'add or refresh a token', value: 'more'}]]),
      when: answers => !_.isEmpty(tokens),
      weight: 100,
    },
  },
  'machine-token': {
    hidden: true,
    interactive: {
      name: 'auth',
      type: 'password',
      message: 'Enter a Pantheon machine token',
      when: answers => _.isEmpty(tokens) || (_.get(answers, 'auth', '') === 'more'),
      weight: 101,
    },
  },
});

// Helper to get pantheon auth non-interactive options
const getNonInteractiveOptions = (token, email) => ({
  'auth': {
    default: token,
    defaultDescription: email,
  },
});

/*
 * Helper to build a pull command
 */
exports.getAuthOptions = ({email = false, token = false} = {}, tokens = []) => {
  if (email && token) return getNonInteractiveOptions(token, email);
  else return getInteractiveOptions(tokens);
};
