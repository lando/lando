'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'memcached',
  config: {
    version: '1',
    supported: ['1', '1.5.12', '1.5.x'],
    pinPairs: {
      '1': 'bitnami/memcached:1.6.1-debian-10-r4',
    },
    patchesSupported: true,
    confSrc: __dirname,
    mem: 64,
    port: '11211',
  },
  parent: '_service',
  builder: (parent, config) => class LandoMemcached extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      const memcached = {
        image: `bitnami/memcached:${options.version}`,
        command: '/bin/sh -c "chmod +x /launch.sh && /launch.sh"',
        environment: {
          MEMCACHED_CACHE_SIZE: options.mem,
        },
        volumes: [
          `${options.confDest}/launch.sh:/launch.sh`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, memcached)});
    };
  },
};
