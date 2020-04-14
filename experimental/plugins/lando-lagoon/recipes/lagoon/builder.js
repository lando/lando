'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const tooling = require('./../../lib/tooling');
const yaml = require('js-yaml');

/*
 * Helper to map lagoon type data to a lando service
 */
const getLandoService = name => {
  switch (name) {
    case 'cli': return 'lagoon-php';
    case 'nginx': return 'lagoon-nginx';
    case 'mariadb': return 'lagoon-mariadb';
    case 'php': return 'lagoon-php';
    case 'redis': return 'lagoon-redis';
    default: return false;
  };
};

/*
 * Build Lagoon
 */
module.exports = {
  name: 'lagoon',
  parent: '_recipe',
  config: {
    confSrc: __dirname,
    flavor: 'drupal',
    xdebug: false,
    webroot: '.',
    proxy: {},
    services: {},
    tooling: {},
  },
  builder: (parent, config) => class LandoLagoon extends parent {
    constructor(id, options = {}) {
      // Get our options
      options = _.merge({}, config, options);

      // Error if we don't have a lagoon.yml
      if (!fs.existsSync(path.join(options.root, '.lagoon.yml'))) {
        throw Error(`Could not detect a .lagoon.yml at ${options.root}`);
      }
      const lagoonConfig = yaml.safeLoad(fs.readFileSync(path.join(options.root, '.lagoon.yml')));

      // Error if we don't have a docker compose
       if (!fs.existsSync(path.join(options.root, lagoonConfig['docker-compose-yaml']))) {
        throw Error(`Could not detect a ${lagoonConfig['docker-compose-yaml']} at ${options.root}`);
      }
      const cConfig = yaml.safeLoad(fs.readFileSync(path.join(options.root, lagoonConfig['docker-compose-yaml'])));

      // Start by injecting the lagoon docker compose config into the corresponding lando services
      _.forEach(cConfig.services, (config, name) => {
        if (getLandoService(name) !== false) {
          options.services[name] = {type: getLandoService(name), lagoon: config};
        }
      });

      // Set basic tooling things
      options.tooling = tooling.get();

      // Set a basic proxy thing
      options.proxy = {nginx: [
        `${options.app}.${options._app._config.domain}:8080`,
      ]};

      // Send downstream
      super(id, options);
    };
  },
};
