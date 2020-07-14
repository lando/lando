'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

/*
 * Init lagoon
 */
module.exports = {
  name: 'lagoon',
  options: lando => ({}),
  overrides: {
    // Set a temporary name that we override later
    name: {
      when: answers => {
        answers.name = _.uniqueId('lagooninit');
        return false;
      },
    },
    webroot: {
      when: () => false,
    },
  },
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
      config: {build: ['composer install']},
    };
  },
};
