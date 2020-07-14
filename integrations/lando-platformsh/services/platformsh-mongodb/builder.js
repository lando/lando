'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-mongodb',
  config: {
    confSrc: __dirname,
    port: '27017',
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformsMongoDB extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Set the meUser
      options.meUser = 'mongodb';

      // Build the mongodb
      const mongodb = {
        image: `docker.registry.platform.sh/mongodb-${options.version}`,
        ports: [options.port],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
        },
        volumes: [
          `${options.data}:/mnt`,
        ],
      };

      // Add in the mongodb service and push downstream
      super(id, options, {services: _.set({}, options.name, mongodb)});
    };
  },
};
