'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-mariadb',
  config: {
    confSrc: __dirname,
    legacy: [],
    port: '3306',
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshMariaDB extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Add 5.5 to the legacy key if this coming from mysql
      if (options.platformsh.type === 'mysql') options.legacy.push('5.5');
      // Set the meUser
      options.meUser = 'app';

      // Build the mariadb
      const mariadb = {
        image: `docker.registry.platform.sh/mariadb-${options.version}`,
        ports: [options.port],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
        },
        volumes: [
          `${options.data}:/mnt/data`,
        ],
      };

      // Add in the mariadb service and push downstream
      super(id, options, {services: _.set({}, options.name, mariadb)});
    };
  },
};
