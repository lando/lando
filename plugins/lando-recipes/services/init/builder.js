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
          ca: {
            command: ['tail', '-f', '/dev/null'],
            image: 'devwithlando/util:stable',
              environment: {
              LANDO_SERVICE_TYPE: 'init',
            },
            volumes: [
              `${app}:/app:delegated`,
              `${userConfRoot}:/lando:delegated`,
              `${home}:/user:delegated`,
            ],
          },
        },
      };

      super('init', _.merge({}, config, {env, labels, userConfRoot}), initService);
    };
  },
};

