'use strict';

// Modules
const _ = require('lodash');

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_platformsh_appserver',
  parent: '_lando',
  builder: parent => class LandoPlatformAppserver extends parent {
    constructor(id, options = {}, ...sources) {
      // The appserver uses the "web" user
      options.meUser = 'web';
      // Get the /run/config.json file location
      const configPath = _.get(options, '_app.config.platformsh.configPath');

      // Set the docker things we need for all appservers
      // @TODO: merge in our applications platform variables
      sources.push({services: _.set({}, options.name, {
        command: 'init',
        environment: {
          LANDO_SERVICE_TYPE: '_platformsh_appserver',
          LANDO_WEBROOT_USER: 'web',
          LANDO_WEBROOT_GROUP: 'web',
          LANDO_WEBROOT_UID: '10000',
          LANDO_WEBROOT_GID: '10000',
          LANDO_NEEDS_EXEC: 'DOEEET',
          PLATFORM_APPLICATION_NAME: options.name,
          PLATFORMSH_CLI_TOKEN: _.get(options, '_app.meta.token'),
          PLATFORM_PROJECT: options.id,
        },
        // @TODO: would be great to not need the below but
        // its required if we want to unmount /etc/hosts /etc/resolv.conf
        privileged: true,
        volumes: [
          // @NOTE: there is some risk here because this actually gets generated
          // AFTER this code runs, eg we assume everything after this works correctly
          `${configPath}/${options.name}.json:/run/config.json`,
        ],
      })});

      // Pass down
      super(id, options, ...sources);
    };
  },
};
