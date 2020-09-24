'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * Build CA service
 */
module.exports = {
  name: '_casetup',
  parent: '_landoutil',
  config: {
    version: 'custom',
    type: 'ca',
    name: 'ca',
  },
  builder: (parent, config) => class LandoCa extends parent {
    constructor(userConfRoot, env = {}, labels = {}) {
      // Get some shitz
      // @TODO: better use of config above
      const certsPath = path.join(userConfRoot, 'certs');
      const setupCaScript = path.join(userConfRoot, 'scripts', 'setup-ca.sh');
      // Basic CA service
      const caService = {
        services: {
          ca: {
            command: ['tail', '-f', '/dev/null'],
            image: 'devwithlando/util:3',
            environment: {
              LANDO_SERVICE_TYPE: 'ca',
            },
            volumes: [
              `${setupCaScript}:/setup-ca.sh`,
              `${certsPath}:/certs`,
            ],
          },
        },
      };
      super('ca', _.merge({}, config, {env, labels, userConfRoot}), caService);
    };
  },
};
