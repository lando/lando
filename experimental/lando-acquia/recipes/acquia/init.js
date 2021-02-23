'use strict';

const _ = require('lodash');
const API = require('../../lib/api');
const utils = require('../../lib/utils');

// Acquia
const api = new API();
const acquiaTokenCache = 'acquia.tokens';
const acquiaLastInitCache = 'acquia.last';
const acquiaApps = [];
let acquiaEnvs = [];

// Helper to get tokens
const getTokens = (lando, tokens = []) => {
  const home = lando.config.home;
  const hostToken = utils.getAcquiaToken(home);
  if (hostToken && _.isEmpty(tokens)) {
    lando.cache.set(acquiaTokenCache, [hostToken], {persist: true});
  }
  return _(utils.sortTokens(tokens))
    .map(token => ({name: token.key, value: token.key}))
    .thru(tokens => tokens.concat([{name: 'add a token', value: 'more'}]))
    .value();
};

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
      apps.map(item => acquiaApps.push({name: item.name, value: item.uuid, group: item.group}));
      return lando.Promise.resolve(acquiaApps);
    }
  });
};

const getAutoCompleteEnvs = (answers, lando, input = null) => {
  if (!_.isEmpty(acquiaEnvs)) {
    return lando.Promise.resolve(acquiaEnvs).filter(app => _.startsWith(app.name, input));
  }
  return api.getEnvironments(answers['acquia-app']).then(envs => {
    if (envs && Array.isArray(envs)) {
      acquiaEnvs = envs.map(item => (_.merge({name: item.label, value: item.id}, item)));
      return acquiaEnvs;
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
        choices: getTokens(lando, lando.cache.get(acquiaTokenCache)),
        message: 'Select your Acquia API key',
        when: answers => showTokenList(answers.recipe, lando.cache.get(acquiaTokenCache)),
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
          // If a token was selected, attempt to login.
          if (answers['acquia-auth'] && answers['acquia-auth'] !== 'more') {
            const token = _.find(lando.cache.get(acquiaTokenCache), token => token.key === answers['acquia-auth']);
            if (token) {
              answers['acquia-key'] = token.key;
              answers['acquia-secret'] = token.secret;
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
          return showTokenEntry(answers.recipe, answers['acquia-auth'], lando.cache.get(acquiaTokenCache));
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
    'acquia-app': {
      describe: 'An Acquia app uuid',
      string: true,
      interactive: {
        type: 'autocomplete',
        message: 'Which application?',
        source: (answers, input) => {
          return getAutoCompleteSites(answers, lando, input);
        },
        when: answers => {
          // Handle selecting site from .acquia-cli.yml file
          if (answers.recipe === 'acquia') {
            if (answers.source === 'cwd') {
              const uuid = utils.getAcliUuid();

              if (uuid !== null) {
                // Build AcquiaApps data and set app uuid
                getAutoCompleteSites(answers, lando);
                answers['acquia-app'] = uuid;
                return false;
              }
            }
            return true;
          }
          return false;
        },
        weight: 540,
      },
    },
    'acquia-env': {
      describe: 'An Acquia environment',
      string: true,
      interactive: {
        type: 'autocomplete',
        message: 'Which environment?',
        source: (answers, input) => {
          return getAutoCompleteEnvs(answers, lando, input);
        },
        when: answers => answers.recipe === 'acquia',
        weight: 540,
      },
    },
  }),
  overrides: {
    name: {
      when: answers => {
        answers.name = _.find(acquiaApps, item => item.value === answers['acquia-app']).name;
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
    build: (options, lando) => ([
      {name: 'get-git-url', func: (options, lando) => {
        // Set git url & branch from env
        const env = _.find(acquiaEnvs, item => item.id === options['acquia-env']);
        options['acquia-git-url'] = env.vcs.url;

        const parts = env.vcs.path.split('/');
        if (parts[0] === 'tags') {
          options['acquia-git-branch'] = parts[1];
        } else {
          options['acquia-git-branch'] = env.vcs.path;
        }
        options['acquia-php-version'] = env.configuration.php.version;
        options['acquia-site-group'] = env.ssh_url.split('.')[0];
      }},
      {
        name: 'clone-repo',
        cmd: options =>
          `/helpers/get-remote-url.sh ${options['acquia-git-url']} "--branch ${options['acquia-git-branch']} --depth 1" "${options['acquia-git-branch']}"`,
        remove: 'true',
      },
    ]),
  }],
  build: (options, lando) => {
    // Write .acli-cli.yml if it doesn't exist.
    utils.writeAcliUuid(options['acquia-app']);
    lando.cache.set(acquiaLastInitCache, options, {persist: true});

    const landofileConfig = {
      config: {
        ah_id: options['acquia-app'],
        ah_group: options['acquia-site-group'],
        php: options['acquia-php-version'],
      },
    };

    // Set the composer version to 1 if it is defined as such in composer.json
    const composerConfig = utils.getComposerConfig();
    if (composerConfig !== null && composerConfig.require['composer/installers']) {
      const composerConfig = utils.getComposerConfig();
      if (composerConfig !== null && composerConfig.require['composer/installers']) {
        const majorVersion = parseInt(composerConfig.require['composer/installers'].replace( /(^.+)(\d)(.+$)/i, '$2'));
        if (majorVersion === 1) {
          landofileConfig.config.composer_version = majorVersion;
        }
      }
    }
    return landofileConfig;
  },
};
