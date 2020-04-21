'use strict';

// Modules
const _ = require('lodash');

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_platformsh_service',
  parent: '_lando',
  builder: parent => class LandoPlatformService extends parent {
    constructor(id, options = {}, ...sources) {
      // Get some stuff from our parsed platform config
      const runConfigPath = _.get(options, 'runConfig.file');

      // A service uses the "app" user
      options.meUser = 'app';

      // Set the docker things we need for all appservers
      sources.push({services: _.set({}, options.name, {
        command: 'init',
        environment: {
          LANDO_SERVICE_TYPE: '_platformsh_appserver',
          LANDO_WEBROOT_USER: 'app',
          LANDO_WEBROOT_GROUP: 'app',
          LANDO_WEBROOT_UID: '1000',
          LANDO_WEBROOT_GID: '1000',
          LANDO_NEEDS_EXEC: 'DOEEET',
        },
        networks: {default: {aliases: [`${options.name}.internal`]}},
        // @TODO: would be great to not need the below but
        // its required if we want to unmount /etc/hosts /etc/resolv.conf
        privileged: true,
        volumes: [
          `${runConfigPath}:/run/config.json`,
        ],
      })});

      // ADD IN OTHER LANDO STUFF? info? etc?
      super(id, options, ...sources);
    };
  },
};
