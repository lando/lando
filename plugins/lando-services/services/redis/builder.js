'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'redis',
  config: {
    version: '5.0',
    supported: ['5', '5.0', '4', '4.0', '2.8'],
    patchesSupported: true,
    confSrc: __dirname,
    persist: false,
    port: '6379',
    defaultFiles: {
      config: 'redis.conf',
    },
    remoteFiles: {
      config: '/usr/local/etc/redis/redis.conf',
    },
  },
  parent: '_database',
  builder: (parent, config) => class LandoRedis extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      const redis = {
        image: `redis:${options.version}`,
        command: 'docker-entrypoint.sh redis-server /usr/local/etc/redis/redis.conf',
        volumes: [
          `${options.confDest}/${options.defaultFiles.config}:${options.remoteFiles.config}`,
        ],
      };
      // Set persistence to true
      if (options.persist) redis.command = `${redis.command} --appendonly yes`;
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, redis)});
    };
  },
};
