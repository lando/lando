'use strict';

const _ = require('lodash');
const API = require('../../lib/api');
const auth = require('../../lib/auth');
const utils = require('../../lib/utils');

// Acquia
const api = new API();
const acquiaApps = [];
let acquiaEnvs = [];

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
      acquiaEnvs = envs.map(item => (_.merge({name: item.name, value: item.id}, item)));
      return acquiaEnvs;
    }
  });
};

const options = lando => (_.merge(auth.getInteractiveOptions(lando), {
  'acquia-app': {
    describe: 'Acquia application uuid',
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
    describe: 'Acquia environment uuid',
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
}));

module.exports = {
  name: 'acquia',
  options,
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
    overrides: {
      recipe: {
        when: answers => {
          answers.recipe = 'acquia';
          return false;
        },
      },
    },
    build: (options, lando) => ([
      {name: 'get-git-url', func: (options, lando) => {
        // Set git url & branch from env
        const env = _.find(acquiaEnvs, item => item.value === options['acquia-env']);
        options['acquia-git-url'] = env.git;

        const parts = env.vcs.split('/');
        if (parts[0] === 'tags') {
          options['acquia-git-branch'] = parts[1];
        } else {
          options['acquia-git-branch'] = env.vcs;
        }
        options['acquia-php-version'] = env.php;
        options['acquia-site-group'] = env.group;
      }},
      {
        name: 'clone-repo',
        cmd: options =>
          `/helpers/get-remote-url.sh ${options['acquia-git-url']} "--branch ${options['acquia-git-branch']}" ` +
          `"${options['acquia-git-branch']}"`,
        remove: 'true',
      },
    ]),
  }],
  build: (options, lando) => {
    // Write .acli-cli.yml if it doesn't exist.
    utils.writeAcliUuid(options['acquia-app']);
    lando.cache.set('acquia.last', options, {persist: true});

    const landofileConfig = {
      config: {
        ah_application_uuid: options['acquia-app'],
        ah_site_group: options['acquia-site-group'],
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
