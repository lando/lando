'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-redis',
  config: {
    version: '5.0',
    supported: ['5.0', '4.0', '3.2', '3.0', '2.8'],
    legacy: ['3.0', '2.8'],
    confSrc: __dirname,
    port: '6379',
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshRedis extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      // Build the redis
      const redis = {
        image: `docker.registry.platform.sh/${options.platformsh.type}-${options.version}`,
        ports: [options.port],
      };
      // Add in the redis service and push downstream
      super(id, options, {services: _.set({}, options.name, redis)});
    };
  },
};
