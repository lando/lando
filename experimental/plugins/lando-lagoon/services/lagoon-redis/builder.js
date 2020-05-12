'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'lagoon-redis',
  config: {
    version: 'custom',
    confSrc: __dirname,
    command: '/sbin/tini -- /lagoon/entrypoints.sh redis-server /etc/redis/redis.conf',
  },
  parent: '_lagoon',
  builder: (parent, config) => class LandoLagoonRedis extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      const redis = {
        command: options.command,
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, redis)});
    };
  },
};
