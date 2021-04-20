'use strict';

// Modules
const _ = require('lodash');
const API = require('../../lib/api');
const path = require('path');
const utils = require('../../lib/utils');

// Acquia
const acquiaKeyCache = 'acquia.keys';
const api = new API();

// Singleton just to hold app/env data
let acquiaApps = [];

// Helper to combine host and cached keys
const mergeKeys = (home, keys = []) => utils.sortKeys(utils.getHostKeys(home), keys);

// Helper to suss out our key and secret
const getAuthPair = answers => {
  // If we dont even have a key then just return the answers unaltered
  if (!answers['acquia-key']) return answers;

  // Otherwise break up auth into parts
  const authParts = answers['acquia-key'].split(':');
  // If we have two parts then we need to separate, otherwise we assume
  // secret and key were passed in separately
  if (authParts.length === 2) {
    answers['acquia-key'] = authParts[0];
    answers['acquia-secret'] = authParts[1];
  }

  // Return
  return {key: answers['acquia-key'], secret: answers['acquia-secret']};
};

// Helper to determine whether to show list of pre-used keys or not
const showKeyList = (data, home, keys = []) => data === 'acquia' && !_.isEmpty(mergeKeys(home, keys));

// Helper to determine whether to show key entry or not
const showKeyEntry = (data, answer, home, keys = []) => {
  return data === 'acquia' && (_.isEmpty(mergeKeys(home, keys)) || answer === 'more');
};

// Helper to determine whether to show secret entry or not
const showSecretEntry = answers => {
  // If there is no acquia key then we should bail on this right good now
  if (!answers['acquia-key']) return false;

  // If we are manually entering another key/secret pair
  if (answers['acquia-needs-secret-entry']) return answers['acquia-needs-secret-entry'];

  // Otherwise we only want to show this in a partial options pass in
  // eg lando init --source acquia --acquia-key my-key
  const authParts = answers['acquia-key'].split(':');
  if (authParts.length === 1) return true;

  // Otherwise i dont think we need to show this
  return false;
};

// Helper to get sites for autocomplete
const getAutoCompleteSites = (answers, lando, input = null) => {
  // We already have apps that we can sort
  if (!_.isEmpty(acquiaApps)) {
    return lando.Promise.resolve(acquiaApps).filter(app => _.startsWith(app.name, input));
  }

  // Get the key and secret so we can populate the list of apps
  // NOTE: we do this here instead of upstream because we do not know exactly
  // how the user is going to provide us with the auth creds
  const {key, secret} = getAuthPair(answers);
  return api.auth(key, secret, true, true)
    .then(() => api.getApplications())
    .then(apps => _.map(apps, app => (_.merge({}, {name: app.name, value: app.uuid}, app))))
    .then(apps => {
      acquiaApps = apps;
      return lando.Promise.resolve(acquiaApps);
    });
};

/*
 * Init Acquia
 */
module.exports = {
  name: 'acquia',
  options: lando => ({
    'acquia-key': {
      describe: 'An Acquia API key',
      string: true,
      interactive: {
        type: 'list',
        choices: utils.getKeys(mergeKeys(lando.config.home, lando.cache.get(acquiaKeyCache))),
        message: 'Select an Acquia Cloud Platform API token',
        when: answers => showKeyList(answers.recipe, lando.config.home, lando.cache.get(acquiaKeyCache)),
        weight: 510,
      },
    },
    'acquia-key-entry': {
      hidden: true,
      interactive: {
        name: 'acquia-key',
        type: 'input',
        message: 'Enter an Acquia API key',
        when: answers => showKeyEntry(
          answers.recipe,
          answers['acquia-key'],
          lando.config.home,
          lando.cache.get(acquiaKeyCache)
        ),
        validate: (input, answers) => {
          // If we end up here we likely need to ask for the secret as well
          if (answers['acquia-key'] === 'more') answers['acquia-needs-secret-entry'] = true;

          // @NOTE: this exists mostly to stealth add acquia-needs-secret-entry
          // but @TODO could actually validate the key as well
          return true;
        },
        weight: 520,
      },
    },
    'acquia-secret': {
      describe: 'An Acquia API secret',
      string: true,
      interactive: {
        name: 'acquia-secret',
        type: 'password',
        message: 'Enter an Acquia API secret',
        when: answers => showSecretEntry(answers),
        weight: 530,
      },
    },
    'acquia-app': {
      describe: 'An Acquia application uuid',
      string: true,
      interactive: {
        type: 'autocomplete',
        message: 'Which site?',
        source: (answers, input) => {
          return getAutoCompleteSites(answers, lando, input);
        },
        when: answers => {
          // Sneak this in here so we can use auth correctly downstream
          getAuthPair(answers);
          // If we can infer this based on local file then let us
          if (answers.recipe === 'acquia' && answers.source === 'cwd') {
            answers['acquia-app'] = utils.getAcliUuid();
            return _.isNil(answers['acquia-app']);
          } else return answers.recipe === 'acquia';
        },
        weight: 540,
      },
    },
    'acquia-key-name': {
      describe: 'A hidden field mostly for easy testing and key removal',
      string: true,
      hidden: true,
      default: 'Landokey',
      when: answers => answers.recipe === 'acquia',
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
    overrides: {
      recipe: {
        when: answers => {
          answers.recipe = 'acquia';
          return false;
        },
      },
    },
    build: (options, lando) => ([
      {
        name: 'get-user-account',
        func: (options, lando) => {
          return api.auth(options['acquia-key'], options['acquia-secret'], true, true)
            .then(() => api.getAccount())
            .then(account => {
              options['acquia-account'] = account;
              options['acquia-keyname'] = `${account.mail}.acquia.lando.id_rsa`;
              options['acquia-keycomment'] = `${account.mail}@lando`;
            });
          },
      },
      {
        name: 'generate-key',
        cmd: options => `/helpers/acquia-generate-key.sh ${options['acquia-keyname']} ${options['acquia-keycomment']}`,
      },
      {
        name: 'post-key',
        func: (options, lando) => {
          const pubKey = path.join(lando.config.userConfRoot, 'keys', `${options['acquia-keyname']}.pub`);
          const keyName = options['acquia-key-name'];
          return api.auth(options['acquia-key'], options['acquia-secret'], true, true)
            .then(() => api.postKey(pubKey, keyName));
        },
      },
      {
        name: 'get-git-url',
        func: (options, lando) => {
          return api.auth(options['acquia-key'], options['acquia-secret'], true, true)
            .then(() => api.getEnvironments(options['acquia-app']))
            .then(envs => {
              // Match our euuid with acquias
              const env = utils.getBestEnv(envs);
              // Get GIT URL
              options['acquia-git-url'] = env.git;
              // And some other things
              const parts = env.vcs.split('/');
              if (parts[0] === 'tags') {
                options['acquia-git-branch'] = parts[1];
              } else {
                options['acquia-git-branch'] = env.vcs;
              }
              options['acquia-php-version'] = env.php;
              options['acquia-site-group'] = env.group;
            });
          },
      },
      {
        name: 'reload-keys',
        cmd: '/helpers/load-keys.sh --silent',
        user: 'root',
      },
      {
        name: 'clone-repo',
        cmd: options =>
          `/helpers/acquia-clone.sh ${options['acquia-git-url']} "--branch ${options['acquia-git-branch']}" ` +
          `${options['acquia-keyname']}`,
        remove: 'true',
      },
  ])}],
  build: (options, lando) => {
    // Get the info we need to build the relevant config
    return api.auth(options['acquia-key'], options['acquia-secret'], true, true)
      .then(() => Promise.all([
        api.getAccount(),
        api.getEnvironments(options['acquia-app']),
      ]))
      .then(data => {
        const account = data[0];
        const env = utils.getBestEnv(data[1]);
        // Write the acli-cli.yml file
        utils.writeAcliUuid(options['acquia-app']);
        // Reset the name to something human readable
        options.name = env.group;
        // Merge in other lando config
        const landofileConfig = {
          config: {
            acli_version: 'latest',
            ah_application_uuid: options['acquia-app'],
            ah_site_group: env.group,
            php: env.php,
          },
        };

        // This is good auth, lets update our cache
        const cache = {
          key: options['acquia-key'],
          label: account.mail,
          secret: options['acquia-secret'],
        };

        // Update lando's store of acquia creds
        const keys = lando.cache.get(acquiaKeyCache) || [];
        lando.cache.set(acquiaKeyCache, utils.sortKeys(keys, [cache]), {persist: true});
        // Update app metdata
        const metaData = lando.cache.get(`${options.name}.meta.cache`);
        lando.cache.set(`${options.name}.meta.cache`, _.merge({}, metaData, cache), {persist: true});

        // Finish up
        return landofileConfig;
      });
    },
};
