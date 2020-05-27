'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-mongodb',
  config: {
    version: '3.6',
    supported: ['3.6', '3.4', '3.2', '3.0'],
    confSrc: __dirname,
    port: '27017',
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
      };
      // Add in the mongodb service and push downstream
      super(id, options, {services: _.set({}, options.name, mongodb)});
    };
  },
};
