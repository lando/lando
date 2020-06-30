'use strict';

// Modules
const _ = require('lodash');

/*
 * Build CA service
 */
module.exports = {
  name: '_init',
  parent: '_lando',
  config: {
    version: 'custom',
    type: 'init',
    name: 'init',
  },
  builder: (parent, config) => class LandoInit extends parent {
    constructor(userConfRoot, home, app, env = {}, labels = {}) {
      // Basic Init service
      const initService = {
        services: {
          init: {
            command: '/bin/sh -c "/helpers/user-perms.sh --silent && tail -f /dev/null"',
            image: 'devwithlando/util:2',
            environment: env,
            labels: labels,
            volumes: [
              `${app}:/app:cached`,
            ],
          },
        },
      };
      // Add moar stuff
      initService.services.init.environment.LANDO_SERVICE_TYPE = 'init';
      initService.services.init.labels['io.lando.service-container'] = 'TRUE';
      initService.services.init.labels['io.lando.init-container'] = 'TRUE';
      super('init', _.merge({}, config, {env, home, labels, userConfRoot}), initService);
    };
  },
};

