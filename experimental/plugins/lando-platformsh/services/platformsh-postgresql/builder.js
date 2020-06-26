'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-postgresql',
  config: {
    confSrc: __dirname,
    legacy: ['9.3'],
    port: '5432',
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshPostgres extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Set the meUser
      options.meUser = 'postgres';

      // Build the postgresql
      const postgresql = {
        image: `docker.registry.platform.sh/postgresql-${options.version}`,
        ports: [options.port],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
          LANDO_RESET_DIR: '/mnt',
        },
        volumes: [
          `${options.data}:/mnt`,
        ],
      };

      // Add in the postgresql service and push downstream
      super(id, options, {services: _.set({}, options.name, postgresql)});
    };
  },
};
