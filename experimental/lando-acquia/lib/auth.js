'use strict';
const _ = require('lodash');
const API = require('./api');
const utils = require('./utils');

// Acquia
const api = new API();
exports.api = api;

let acquiaKeys = {};
const getKeyChoices = (lando=null) => {
  if (lando !== null && _.isEmpty(acquiaKeys)) {
    acquiaKeys = utils.getAcquiaKeyChoices(lando);
  }
  return acquiaKeys;
};

// Helper to determine whether to show list of pre-used tokens or not
const showKeyList = (recipe, keys = []) => recipe === 'acquia' && !_.isEmpty(keys);
const showKeyEntry = (recipe, answer, keys = []) => recipe === 'acquia' && (_.isEmpty(keys) || answer === 'more');

// Helper to get pantheon auth non-interactive options
exports.getInteractiveOptions = (lando, appConfig=null) => ({
  'acquia-auth': {
    describe: 'Acquia API key',
    string: true,
    interactive: {
      type: 'list',
      choices: utils.getAcquiaKeyChoices(lando),
      message: 'Select your Acquia API key',
      when: answers => {
        // TODO: I think we can remove this if it's only added when using an acquia recipe.
        answers.recipe = 'acquia';
        if (answers.recipe !== 'acquia') {
          return false;
        }
        // Prepare inquirer for application scoped call.
        if (appConfig) {
          answers['acquia-app'] = appConfig.config.ah_application_uuid;
          const key = utils.getAcquiaKeyFromApp(lando, appConfig);
          // Validate auth if key is cached. Token is stored in api and reused on subsequent actions.
          if (key) {
            // Set answers if authentication works.
            return api.auth(key.uuid, key.secret, false, true).then(() => {
              answers['authenticated'] = true;
              answers['acquia-auth'] = key.uuid;
              answers['acquia-key'] = key.uuid;
              answers['acquia-secret'] = key.secret;
              return false;
            });
          }
        }
        acquiaKeys = getKeyChoices(lando);
        return !answers['acquia-auth'] && showKeyList(answers.recipe, acquiaKeys);
      },
      weight: 510,
    },
  },
  'acquia-key': {
    describe: 'Acquia API key',
    hidden: false,
    passthrough: true,
    interactive: {
      name: 'acquia-key',
      type: 'input',
      message: 'Enter your Acquia API key',
      when: answers => {
        // If a token was selected, attempt to login.
        if (answers['acquia-auth'] && answers['acquia-auth'] !== 'more') {
          const key = _.find(acquiaKeys, key => key.value === answers['acquia-auth']);
          if (key) {
            answers['acquia-key'] = key.value;
            answers['acquia-secret'] = key.secret;
            return api.auth(answers['acquia-key'], answers['acquia-secret']).then(() => {
              return false;
            }).catch(err => {
              // Clear out token data and prompt user.
              answers['acquia-key'] = null;
              answers['acquia-secret'] = null;
              return true;
            });
          }
        }
        return !answers['acquia-key'] && showKeyEntry(answers.recipe, answers['acquia-auth'], acquiaKeys);
      },
      weight: 520,
    },
  },
  'acquia-secret': {
    description: 'Acquia API secret',
    hidden: true,
    passthrough: true,
    interactive: {
      name: 'acquia-secret',
      type: 'password',
      message: 'Enter your Acquia API secret',
      when: answers => {
        return !answers['acquia-secret'] && showKeyEntry(answers.recipe, answers['acquia-auth'], acquiaKeys);
      },
      validate: (input, answers) => {
        return api.auth(answers['acquia-key'], input).then(() => {
          let token = _.find(lando.cache.get(acquiaTokenCache), token => token.key === answers['acquia-key']);
          if (!token) {
            // Re-create the token as acli would so acli can use it in a container.
            token = {
              send_telemetry: false,
              key: answers['acquia-key'],
              secret: answers['acquia-secret'],
            };
            lando.cache.set(acquiaTokenCache, [token], {persist: true});
          }
          return true;
        }).catch(err => {
          return err;
        });
      },
      weight: 530,
    },
  },
});
