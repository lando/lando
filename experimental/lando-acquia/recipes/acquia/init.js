'use strict';

const _ = require('lodash');
const API = require('../../lib/api');
const utils = require('../../lib/utils');

// Acquia
const api = new API();
const acquiaTokenCache = 'acquia.tokens';
const acquiaApps = [];

// Helper to get tokens
const getTokens = (home, tokens = []) => _(utils.sortTokens(utils.getAcquiaTokens(home), tokens))
  .map(token => ({name: token.email, value: token.token}))
  .thru(tokens => tokens.concat([{name: 'add or refresh a token', value: 'more'}]))
  .value();

// Helper to determine whether to show list of pre-used tokens or not
const showTokenList = (recipe, tokens = []) => recipe === 'acquia' && !_.isEmpty(tokens);

// Helper to determine whether to show token password entry or not
const showTokenEntry = (data, answer, tokens = []) => data === 'acquia' && (_.isEmpty(tokens) || answer === 'more');

const getAutoCompleteSites = (answers, lando, input = null) => {
  if (!_.isEmpty(acquiaApps)) {
    return lando.Promise.resolve(acquiaApps).filter(app => _.startsWith(app.name, input));
  }
  return api.getApplications().then(apps => {
    if (apps && Array.isArray(apps)) {
      apps.map(item => acquiaApps.push({name: item.name, value: item.name}));
      return lando.Promise.resolve(acquiaApps);
    }
  });
};

module.exports = {
  name: 'acquia',
  options: lando => ({
    'acquia-auth': {
      describe: 'Acquia API Key',
      string: true,
      interactive: {
        type: 'list',
        choices: getTokens(lando.config.home, lando.cache.get(acquiaTokenCache)),
        message: 'Select your Acquia API key',
        when: answers => {
          return showTokenList(answers.recipe, lando.cache.get(acquiaTokenCache));
        },
        weight: 510,
      },
    },
    'acquia-key': {
      hidden: false,
      interactive: {
        name: 'acquia-key',
        type: 'password',
        message: 'Enter your Acquia API key',
        when: answers => {
          return showTokenEntry(answers.recipe, answers['acquia-auth'], lando.cache.get(acquiaTokenCache));
        },
        weight: 520,
      },
    },
    'acquia-secret': {
      hidden: true,
      interactive: {
        name: 'acquia-secret',
        type: 'password',
        message: 'Enter your Acquia API secret',
        when: answers => {
          return true;
          // return showTokenEntry(answers.recipe, answers['acquia-auth'], lando.cache.get(acquiaTokenCache));
        },
        validate: (input, answers) => {
          return api.auth(answers['acquia-key'], input).then(() => {
            return true;
          }).catch(err => {
            return err;
          });
        },
        weight: 530,
      },
    },
    'acquia-app': {
      describe: 'An Acquia site ID',
      string: true,
      interactive: {
        type: 'autocomplete',
        message: 'Which site?',
        source: (answers, input) => {
          // console.log('**', acquiaApps);
          return getAutoCompleteSites(answers, lando, input);
        },
        when: answers => answers.recipe === 'acquia',
        weight: 540,
      },
    },
  }),
  overrides: {
    name: {
      when: answers => {
        answers.name = answers['acquia-app'];
        return false;
      },
    },
    webroot: {
      when: () => false,
    },
  },
  sources: [{
    name: 'acquia',
    label: 'acquia',
  }],
  build: (options, lando) => {
    return {
    };
  },
};
