'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const api = require('../../lib/api');
const utils = require('../../lib/utils');

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

// Helper to get sites for autocomplete
const getAutoCompleteSites = (keyId, lando, input = null) => {
  const lagoonApi = api.getLagoonApi(keyId, lando, input);
  return lagoonApi.getProjects().then(projects => {
    return _.map(projects, project => ({name: project.name, value: project.name}))
      .filter(project => !input || _.startsWith(project.name, input));
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
      default: answers => answers.recipe === 'lagoon' && !_.isEmpty(lando.cache.get(utils.keyCacheId)),
      weight: 500,
    },
    'lagoon-auth': {
      describe: 'A Lagoon SSH key',
      string: true,
      interactive: {
        type: 'list',
        choices: utils.getKeyChoices(lando),
        message: 'Select a Lagoon account',
        when: answers => {
          answers['lagoon-has-keys'] = answers.recipe === 'lagoon' && !_.isEmpty(lando.cache.get(utils.keyCacheId));
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
          return getAutoCompleteSites(answers['lagoon-auth'], lando, input).then(sites => {
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
          // When will then be now? SOON
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
      // Flow for new keys
      if (options['lagoon-auth'] === 'new') {
        return [{
          name: 'generate-key',
          // eslint-disable-next-line max-len
          cmd: `/helpers/lagoon-generate-key.sh "${getKeyId(keyDefaults.host, options.lagoonEmail)}" "${options.lagoonEmail}"`,
        }];
      }

      // Otherwise do get the site get thing
      // const lagoonApi = api.getLagoonApi(_.merge({}, keyDefaults, {
      //   id: options['lagoon-auth'],
      // }), lando);

      return api.getLagoonApi(options['lagoon-auth'], lando).getProject(options['lagoon-site']).then(project => {
        return [{
          name: 'clone-repo',
          cmd: () => `/helpers/lagoon-clone.sh ${project.gitUrl}`,
          remove: true,
        }];
      });
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
      const keyCache = lando.cache.get(utils.keyCacheId);
      lando.cache.set(utils.keyCacheId, utils.sortKeys(keyCache, [key]), {persist: true});
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
      config: {
        build: ['composer install'],
      },
    };
  },
};
