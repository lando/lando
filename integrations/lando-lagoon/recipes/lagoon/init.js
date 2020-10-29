'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const api = require('../../lib/api');
const keys = require('../../lib/keys');
const authDialogOptions = require('../../lib/auth-dialog-options');

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
  options: lando => {
    // Set authentication options which facilitates new key workflow.
    // Note that keys.currentKey is set in auth-dialog-options and managed
    // globally because of state limitations in inquirer.
    const opts = authDialogOptions(lando, true);
    // Continue init options.
    opts['lagoon-site'] = {
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
    };
    return opts;
  },
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
