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

    // @TODO: eventually we need a "flavor" option that will decide the config below
    // for now we assume a "drupal" flavor eg Drupal 8
    // Set the name and other things
    return {
      name: lagoonConfig.project,
      config: {
        flavor: 'drupal',
        build: ['composer install'],
      },
    };
  },
};
