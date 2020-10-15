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
  .thru(tokens => tokens.concat([{name: 'add or refresh a key', value: 'new'}]))
  .value();

// Helper to get sites for autocomplete
const getAutoCompleteSites = (keyId, lando) => {
  const keyCache = lando.cache.get(lagoonKeyCache);
  const key = _.find(keyCache, key => key.id === keyId);
  lagoonApi = getLagoonApi(key, lando);
  return lagoonApi.getProjects().then(projects => {
    return _.map(projects, project => ({name: project.name, value: project.name}));
  });
};

const exit = () => process.exit(1);

/*
 * Init lagoon
 */
module.exports = {
  name: 'lagoon',
  options: lando => ({
    'lagoon-has-keys': {
      describe: 'A hidden field mostly for easy testing and key removal',
      string: true,
      hidden: true,
      default: answers => answers.recipe === 'lagoon' && !_.isEmpty(lando.cache.get(lagoonKeyCache)),
      weight: 500,
    },
    'lagoon-auth': {
      describe: 'A Lagoon SSH key',
      string: true,
      interactive: {
        type: 'list',
        choices: getKeys(lando),
        message: 'Select a Lagoon account',
        when: answers => {
          answers['lagoon-has-keys'] = answers.recipe === 'lagoon' && !_.isEmpty(lando.cache.get(lagoonKeyCache));
          return answers['lagoon-has-keys'];
        },
        weight: 505,
      },
    },
    'lagoon-auth-email': {
      hidden: true,
      string: true,
      interactive: {
        name: 'lagoon-auth',
        type: 'string',
        message: 'Lagoon account email',
        when: answers => {
          return answers.recipe === 'lagoon' && (answers['lagoon-auth'] === 'new' || !answers['lagoon-has-keys']);
        },
        weight: 510,
      },
    },
    'lagoon-site': {
      describe: 'A Lagoon project name',
      string: true,
      interactive: {
        type: 'autocomplete',
        message: 'Which project?',
        source: (answers, input) => {
          return getAutoCompleteSites(answers['lagoon-auth'], lando).then(sites => {
            return _.orderBy(sites, ['name']);
          });
        },
        when: answers => {
          // Check if auth is a key or an email
          // NOTE: this is a weaksauce check
          const isEmail = _.includes(answers['lagoon-auth'], '@');
          // If is email then set and spoof
          if (isEmail) {
            answers.lagoonEmail = answers['lagoon-auth'];
            answers['lagoon-auth'] = 'new';
          }
          // Go back to the usual
          return answers.recipe === 'lagoon' && answers['lagoon-auth'] && answers['lagoon-auth'] !== 'new';
        },
        weight: 510,
      },
    },
  }),
  overrides: {
    webroot: {
      when: () => false,
    },
    name: {
      when: answers => {
        answers.name = answers['lagoon-site'];
        return false;
      },
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
      if (options['lagoon-auth'] === 'new' || !options['lagoon-has-keys']) {
        buildSteps.push({
          name: 'generate-key',
          // eslint-disable-next-line max-len
          cmd: `/helpers/lagoon-generate-key.sh "${getKeyId(keyDefaults.host, options.lagoonEmail)}" "${options.lagoonEmail}"`,
        });
      } else {
        const project = lagoonApi.getProject(options['lagoon-site']);
        buildSteps.push({
          name: 'clone-repo',
          cmd: options => `/helpers/lagoon-clone.sh ${project.gitUrl}`,
          remove: true,
        });
      }
      return buildSteps;
    },
  }],
  build: (options, lando) => {
    // Exit if we just generated a Lando key.
    if (options.lagoonEmail) {
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
