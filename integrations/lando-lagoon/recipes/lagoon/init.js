'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const api = require('../../lib/api');
const keys = require('../../lib/keys');

// Helper to get sites for autocomplete
const getAutoCompleteSites = (keyId, lando, input = null) => {
  return api.getLagoonApi(keyId, lando).getProjects().then(projects => {
    return _.map(projects, project => ({name: project.name, value: project.name}))
      .filter(project => !input || _.startsWith(project.name, input));
  });
};

/*
 * Init lagoon
 */
module.exports = {
  name: 'lagoon',
  options: lando => ({
    'lagoon-auth': {
      describe: 'A Lagoon SSH key',
      string: true,
      interactive: {
        type: 'list',
        choices: keys.getKeyChoices(lando),
        message: 'Select a Lagoon account',
        filter: answer => {
          if (answer === 'new') {
            // Generate a new key if user selected new.
            return keys.generateKeyAndWait(lando).then(() => {
              return answer;
            });
          }
          return answer;
        },
        when: answers => {
          if (answers.recipe !== 'lagoon') {
            return false;
          }
          // Set this answer for easy access later.
          answers['lagoon-has-keys'] = !_.isEmpty(keys.getCachedKeys(lando));
          // Auto generate new key if there are no keys.
          if (!answers['lagoon-has-keys']) {
            return keys.generateKeyAndWait(lando).then(() => {
              // return false so this option is not shown.
              return false;
            });
          }
          return true;
        },
        weight: 500,
      },
    },
    'lagoon-new-key': {
      hidden: true,
      string: true,
      interactive: {
        name: 'lagoon-new-key',
        type: 'input',
        message: 'Copy/paste the SSH key above into the Lagoon UI; Then press [Enter]',
        validate: () => {
          // Attempt whoami
          // When we support alternate host, port, and uri, they will need to be passed into opts here.
          const opts = {};
          // Creates/updates lagoon-pending key and writes data to cache
          keys.setPendingKey(lando, opts);

          return api.getLagoonApi('lagoon-pending', lando).whoami()
            .then(data => {
              // Set email and promote pending key and cache data
              opts.email = data.email;
              // promotePendingKey sets keys.currentKey which is used in the next step.
              keys.promotePendingKey(lando, opts);
              return true;
            })
            .catch(error => {
              // Returning a string displays it as an error and allows them to try again.
              return 'Authentication failed. Please try again.';
            });
        },
        when: answers => {
          // Print the SSH KEY for the user to copy & paste over in the Lagoon UI.
          if (answers.recipe === 'lagoon' && keys.lastKeyGeneratedOutput !== null) {
            process.stdout.write(keys.lastKeyGeneratedOutput);
            return true;
          }
        },
        weight: 520,
      },
    },
    'lagoon-site': {
      describe: 'A Lagoon project name',
      string: true,
      interactive: {
        type: 'autocomplete',
        message: 'Which project?',
        source: (answers, input) => {
          // Set key to current key if the key was generated during this run.
          if (keys.currentKey && keys.currentKey.id) {
            answers['lagoon-auth'] = keys.currentKey.id;
          }
          return getAutoCompleteSites(answers['lagoon-auth'], lando, input).then(sites => {
            return _.orderBy(sites, ['name']);
          });
        },
        when: answers => {
          return answers.recipe === 'lagoon';
        },
        weight: 530,
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
