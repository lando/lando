'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-memcached',
  config: {
    version: '1.6',
    supported: ['1.6', '1.5', '1.4'],
    confSrc: __dirname,
    port: '11211',
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshMemcached extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Set the meUser
      options.meUser = 'app';

      // Build the memcached
      const memcached = {
        image: `docker.registry.platform.sh/memcached-${options.version}`,
        ports: [options.port],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
        },
      };
      // Add in the memcached service and push downstream
      super(id, options, {services: _.set({}, options.name, memcached)});
    };
  },
};
