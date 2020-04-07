'use strict';

// Modules
const fs = require('fs');
const path = require('path');

/*
 * Init lagoon
 */
module.exports = {
  name: 'lagoon',
  options: lando => ({}),
  overrides: {
    name: {
      when: () => false,
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

    // Set the name and other things
    return {
      name: lagoonConfig.project,
      config: {
        flavor: 'drupal',
      },
    };
  },
};
