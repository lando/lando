'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const keys = require('./../../lib/keys');
const os = require('os');
const path = require('path');

const LagoonApi = require('./../../lib/api');

// Lagoon
const lagoonKeysCache = 'lagoon.keys';

// Helper to determine whether to show list of pre-used keys or not
const showKeyList = (data, keys = []) => data === 'lagoon' && !_.isEmpty(keys);

// Helper to determine whether to show keygen workflow or not
const showKeyGenerate = (data, answer, keys = []) => data === 'lagoon' && (_.isEmpty(keys) || answer === 'more');

// Helper to get sites for autocomplete
const getAutoCompleteSites = (answers, lando, input = null) => {
  const api = new LagoonApi(keys.getPreferredKey(answers), lando);
  return api.auth().then(() => api.getProjects().then(projects => {
    return _.map(projects, project => ({name: project.name, value: project.name}))
      .filter(project => !input || _.startsWith(project.name, input));
  }));
};

/*
 * Init Lagoon
 */
module.exports = {
  name: 'lagoon',
  options: lando => ({
    'lagoon-auth': {
      describe: 'A Lagoon ssh key',
      string: true,
      interactive: {
        type: 'list',
        choices: keys.getKeys(lando.cache.get(lagoonKeysCache)),
        message: 'Select a Lagoon account',
        when: answers => showKeyList(answers.recipe, lando.cache.get(lagoonKeysCache)),
        weight: 510,
      },
    },
    'lagoon-auth-key': {
      hidden: true,
      interactive: {
        name: 'lagoon-auth',
        default: 'lagoon.amazeeio.cloud:32222',
        type: 'input',
        message: 'Copy/paste the SSH key above into the Lagoon UI; Enter the lagoon host and then press [Enter]',
        // Print the key for us to use
        when: answers => {
          // Figure out whether this is a new key workflow or not
          const show = showKeyGenerate(answers.recipe, answers['lagoon-auth'], lando.cache.get(lagoonKeysCache));
          // Show the key as needed
          if (show) {
            return keys.generateKey(lando).then(() => {
              return true;
            });
          } else {
            return false;
          }
        },
        // Validate the key and update the key with host/port
        validate: (input, answers) => {
          const key = path.join(os.homedir(), '.lando', 'keys', 'lagoon-pending');
          answers['lagoon-auth'] = `${key}@${input}`;
          return getAutoCompleteSites(answers, lando, input)
            .then(() => {
              // We set this here so we can pass it along separately
              answers['lagoon-auth-generate'] = answers['lagoon-auth'];
              // REturn true
              return true;
            })
            .catch(err => err);
        },
        weight: 520,
      },
    },
    'lagoon-site': {
      describe: 'A Lagoon project name',
      string: true,
      interactive: {
        type: 'autocomplete',
        message: 'Which site?',
        source: (answers, input) => {
          return getAutoCompleteSites(answers, lando, input)
            .then(sites => _.orderBy(sites, ['name']));
        },
        when: answers => answers.recipe === 'lagoon',
        weight: 530,
      },
    },
  }),
  overrides: {
    name: {
      when: answers => {
        answers.name = answers['lagoon-site'];
        return false;
      },
    },
    webroot: {
      when: () => false,
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
      // Get the API
      const api = new LagoonApi(keys.getPreferredKey(options), lando);
      // Auth and get projects
      return api.auth().then(() => api.getProjects().then(projects => {
        // Try to find the project we need
        const project = _.find(projects, {name: options['lagoon-site']});
        // Error if projects does nto exist
        if (!project) throw Error(`Could not find a site called ${options['lagoon-site']}`);
        // Reload key and proceed git clone ops
        return [
          {name: 'reload-keys', cmd: '/helpers/load-keys.sh --silent', user: 'root'},
          {name: 'clone-repo', cmd: `/helpers/lagoon-clone.sh ${project.gitUrl}`, remove: true},
        ];
      }));
    },
  }],
  build: (options, lando) => {
    // Get the API
    const api = new LagoonApi(keys.getPreferredKey(options), lando);
    // Figure out who i am
    return api.auth().then(() => api.whoami().then(me => {
      // if this is a generated key lets move it
      if (_.has(options, 'lagoon-auth-generate')) {
        // Get the generated key
        const auth = options['lagoon-auth-generate'];
        const generatedKey = _.first(auth.split('@'));
        // Get the new key
        const newKey = path.join(os.homedir(), '.lando', 'keys', `lagoon-${me.id}`);
        // Move the key
        fs.renameSync(generatedKey, newKey);
        options['lagoon-auth-generate'] = _.replace(auth, generatedKey, newKey);
        // Remove older stuff
        fs.unlinkSync(`${generatedKey}.pub`);
      }

      // Get the preferred key
      const key = keys.getPreferredKey(options);

      // Update lando's store of lagoon keys
      const cachedKeys = lando.cache.get(lagoonKeysCache) || [];
      const cache = {
        date: _.toInteger(_.now() / 1000),
        key,
        email: me.email,
      };
      lando.cache.set(lagoonKeysCache, [cache], {persist: true});
      lando.cache.set(lagoonKeysCache, keys.sortKeys(cachedKeys, [cache]), {persist: true});

      // Update the app metadata cache
      const metaData = lando.cache.get(`${options.name}.meta.cache`);
      lando.cache.set(`${options.name}.meta.cache`, _.merge({}, metaData, cache), {persist: true});

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
    }));
  },
};
