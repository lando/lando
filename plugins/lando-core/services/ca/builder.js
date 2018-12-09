'use strict';

// Modules
const path = require('path');

/*
 * Build CA service
 */
module.exports = {
  name: '_casetup',
  parent: '_landoutil',
  config: {
    version: 'custom',
  },
  builder: parent => class LandoCa extends parent {
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
            image: 'devwithlando/util:stable',
            volumes: [
              `${setupCaScript}:/setup-ca.sh`,
              `${certsPath}:/certs`,
            ],
          },
        },
      };
      super('ca', {type: 'ca', name: 'ca', env, labels, userConfRoot}, caService);
    };
  },
};
