'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_platformsh_appserver',
  parent: '_lando',
  builder: parent => class LandoPlatformAppserver extends parent {
    constructor(id, options = {}, ...sources) {
      // Get some stuff from our parsed platform config
      const environment = _.get(options, 'platformsh.variables', {});
      const runConfigPath = _.get(options, 'runConfig.file');
      const bootScript = path.join(options.userConfRoot, 'scripts', 'boot-psh.sh');

      // A appserver uses the "web" user
      options.meUser = 'web';

      // Set the docker things we need for all appservers
      sources.push({services: _.set({}, options.name, {
        command: 'exec init',
        environment: _.merge({}, environment, {
          LANDO_NO_USER_PERMS: 'NOTGONNADOIT',
          LANDO_SERVICE_TYPE: '_platformsh_appserver',
          PLATFORMSH_CLI_TOKEN: _.get(options, '_app.meta.token'),
        }),
        // @TODO: would be great to not need the below but
        // its required if we want to unmount /etc/hosts /etc/resolv.conf
        privileged: true,
        volumes: [
          `${runConfigPath}:/run/config.json`,
          `${bootScript}:/scripts/001-boot-platformsh`,
        ],
      })});

      // Pass down
      super(id, options, ...sources);
    };
  },
};
