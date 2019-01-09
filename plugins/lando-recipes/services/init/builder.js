'use strict';

// Modules
const _ = require('lodash');

/*
 * Build CA service
 */
module.exports = {
  name: '_init',
  parent: '_landoutil',
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
            command: ['tail', '-f', '/dev/null'],
            image: 'devwithlando/util:2',
              environment: {
              LANDO_SERVICE_TYPE: 'init',
            },
            volumes: [
              `${app}:/app:delegated`,
            ],
          },
        },
      };
      super('init', _.merge({}, config, {env, home, labels, userConfRoot}), initService);
    };
  },
};

