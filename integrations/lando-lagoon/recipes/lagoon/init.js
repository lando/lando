'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const LagoonApi = require('../../lib/client');
const utils = require('../../lib/utils');

const lagoonKeyCache = 'lagoon.keys';

// Setting global so it only ever gets instantiated once.
let lagoonApi = null;
const getLagoonApi = (key = null, lando = null) => {
  if (lagoonApi !== null) {
    return lagoonApi;
  }
  if (key === null || lando === null) {
    throw new Error('Cannot get lagoonApi for the first time without key and lando');
  }
  return new LagoonApi(key, lando);
};

const keyDefaults = {
  // Key id is used for the ssh filename
  id: null,
  name: null,
  email: null,
  host: 'ssh.lagoon.amazeeio.cloud',
  port: '32222',
  user: 'lagoon',
  url: 'https://api.lagoon.amazeeio.cloud',
  date: _.toInteger(_.now() / 1000),
};

const getKeyId = (host, email = '') => `lagoon_${email.replace('@', '-at-')}_${host}`;

const getKeys = (lando = []) => _(utils.getProcessedKeys(lando))
    .map(key => ({name: key.email, value: key.id}))
    .thru(tokens => tokens.concat([{name: 'add or refresh a token', value: 'new'}]))
    .value();

// Helper to get sites for autocomplete
const getAutoCompleteSites = (keyId, lando) => {
  const keyCache = lando.cache.get(lagoonKeyCache);
  const key = _.find(keyCache, key => key.id === keyId);
  // lagoonApi = lagoonApi !== null ? lagoonApi : new LagoonApi(key, lando);
  lagoonApi = getLagoonApi(key, lando);
  return lagoonApi.getProjects().then(projects => {
    return _.map(projects, project => ({name: project.name, value: project.id}));
  });
};

const exit = () => process.exit(1);

/*
 * Init lagoon
 */
module.exports = {
  name: 'lagoon',
  options: lando => ({
    lagoonHasKeys: {
      describe: 'A hidden field mostly for easy testing and key removal',
      string: true,
      hidden: true,
      default: answers => answers.recipe === 'lagoon' && !_.isEmpty(lando.cache.get(lagoonKeyCache)),
      weight: 500,
    },
    lagoonKey: {
      describe: 'A Lagoon SSH key',
      string: true,
      interactive: {
        type: 'list',
        choices: getKeys(lando),
        message: 'Select a Lagoon account',
        when: answers => {
          answers.lagoonHasKeys = answers.recipe === 'lagoon' && !_.isEmpty(lando.cache.get(lagoonKeyCache));
          return answers.lagoonHasKeys;
        },
        weight: 505,
      },
    },
    lagoonEmail: {
      describe: 'Lagoon account email address',
      string: true,
      interactive: {
        type: 'string',
        message: 'Lagoon account email',
        when: answers => answers.recipe === 'lagoon' && (answers.lagoonKey === 'new' || !answers.lagoonHasKeys),
        weight: 510,
      },
    },
    lagoonProjectId: {
      describe: 'A Lagoon project name',
      string: true,
      interactive: {
        type: 'autocomplete',
        message: 'Which project?',
        source: (answers, input) => {
          return getAutoCompleteSites(answers.lagoonKey, lando).then(sites => {
            return _.orderBy(sites, ['name']);
          });
        },
        when: answers => answers.recipe === 'lagoon' && answers.lagoonKey && answers.lagoonKey !== 'new',
        weight: 510,
      },
    },
  }),
  overrides: {
    webroot: {
      when: () => false,
    },
    name: {
      when: answers => answers.recipe === 'lagoon' && answers.lagoonHasKeys,
    },
  },
  sources: [{
    name: 'lagoon',
    label: 'lagoon',
    overrides: {
      recipe: {
        when: answers => {
          answers.recipe = 'lagoon';
          return false;
        },
      },
    },
    build: (options, lando) => {
      const buildSteps = [];
      if (options.lagoonKey === 'new' || !options.lagoonHasKeys) {
        buildSteps.push({
          name: 'generate-key',
          // eslint-disable-next-line max-len
          cmd: `/helpers/lagoon-generate-key.sh "${getKeyId(keyDefaults.host, options.lagoonEmail)}" "${options.lagoonEmail}"`,
        });
      } else {
        const p = lagoonApi.getProject(options.lagoonProjectId);
        const sshKeyFile = `/lando/keys/${options.lagoonKey}`;
        buildSteps.push({
          name: 'clone-repo',
          // eslint-disable-next-line max-len
          cmd: options => `/helpers/lagoon-clone.sh ${p.gitUrl} ${sshKeyFile}`,
          remove: true,
        });
      }
      return buildSteps;
    },
  }],
  build: (options, lando) => {
    // Exit if we just generated a Lando key.
    if (options.lagoonEmail !== '') {
      // Add key data to cache
      const key = _.merge({}, keyDefaults, {
        id: getKeyId(keyDefaults.host, options.lagoonEmail),
        name: `${options.lagoonEmail} [${keyDefaults.host}]`,
        email: options.lagoonEmail,
      });
      const keyCache = lando.cache.get(lagoonKeyCache);
      lando.cache.set(lagoonKeyCache, utils.sortKeys(keyCache, [key]), {persist: true});
      exit();
    }

    // Path to lagoonfile
    const lagoonFile = path.join(options.destination, '.lagoon.yml');
    // Error if we don't have a lagoon.yml
    if (!fs.existsSync(lagoonFile)) {
      throw Error(`Could not detect a .lagoon.yml at ${options.destination}`);
    }
    // Parse the Lagoon config
    const lagoonConfig = lando.yaml.load(lagoonFile);

    // Throw an error if there is no project set
    if (!_.has(lagoonConfig, 'project')) {
      throw Error('Lando currently requires that a project be set in your .lagoon.yml!');
    }

    // Set this so it shows correctly after init
    options.name = lagoonConfig.project;
    // Always reset the name based on the lagoon project
    return {
      name: options.name,
      config: {build: ['composer install']},
    };
  },
};
