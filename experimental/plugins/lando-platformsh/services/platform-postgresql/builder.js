'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-postgresql',
  config: {
    version: '11',
    supported: ['12', '11', '10', '9.6', '9.3'],
    legacy: ['9.3'],
    confSrc: __dirname,
    port: '5432',
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshMariaDB extends parent {
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
        },
        // @TODO: get persistent data over rebuild
        /*
        volumes: [
          `${options.data}:/mnt/data`,
        ],
        */
      };
      // Add in the postgresql service and push downstream
      super(id, options, {services: _.set({}, options.name, postgresql)});
    };
  },
};
