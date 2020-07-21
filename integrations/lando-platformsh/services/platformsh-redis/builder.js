'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-redis',
  config: {
    confSrc: __dirname,
    legacy: ['3.0', '2.8'],
    port: '6379',
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshRedis extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Set the meUser
      options.meUser = 'app';

      // Build the redis
      const redis = {
        image: `docker.registry.platform.sh/${options.platformsh.type}-${options.version}`,
        ports: [options.port],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
        },
        volumes: [
          `${options.data}:/mnt/data`,
        ],
      };

      // Add in the redis service and push downstream
      super(id, options, {services: _.set({}, options.name, redis)});
    };
  },
};
