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
    port: '6379',
    portforward: true,
    moreHttpPorts: ['6379'],
  },
  parent: '_lagoon',
  builder: (parent, config) => class LandoLagoonRedis extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      const redis = {
        command: options.command,
        ports: [options.port],
      };
      // Add some lando info
      options.info = _.merge({}, options.info, {
        internal_connection: {
          host: options.name,
          port: options.port,
        },
        external_connection: {
          host: options._app._config.bindAddress,
          port: _.get(options, 'portforward', 'not forwarded'),
        },
      });
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, redis)});
    };
  },
};
