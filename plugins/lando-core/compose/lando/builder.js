'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * The lowest level lando service, this is where a lot of the deep magic lives
 */
module.exports = {
  name: '_lando',
  parent: '_compose',
  builder: parent => class LandoService extends parent {
    constructor(id, options, ...sources) {
      // Get some basic locations
      const scriptsDir = path.join(options.userConfRoot, 'scripts');
      const entrypoint = path.join(scriptsDir, 'lando-entrypoint.sh');
      const addCerts = path.join(scriptsDir, 'add-cert.sh');
      const refreshCerts = path.join(scriptsDir, 'refresh-certs.sh');

      // Handle Volumes
      const volumes = [
        `${options.userConfRoot}:/lando:delegated`,
        `${scriptsDir}:/helpers`,
        `${entrypoint}:/lando-entrypoint.sh`,
      ];

      // Handle Scripts
      // Generate certs if ssl is turned on
      if (options.ssl) {
        volumes.push(`${addCerts}:/scripts/add-cert.sh`);
      }
      // Refresh certs is indicated
      if (options.refreshCerts) {
        volumes.push(`${refreshCerts}:/scripts/refresh-certs.sh`);
      }

      // Handle Environment
      const environment = {
        LANDO_SERVICE_NAME: options.name,
        LANDO_SERVICE_TYPE: options.type,
      };

      // Loop through our managed services and add in the above
      _.forEach(options.manage, service => {
        sources.push({services: _.set({}, service, {
          entrypoint: '/lando-entrypoint.sh',
          environment,
          volumes,
        })});
      });

      // Handle overrides
      // THESE MUST COME LAST
      super(id, ...sources);
    };
  },
};
