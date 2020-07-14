'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-influxdb',
  config: {
    confSrc: __dirname,
    port: '8086',
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshInfluxdb extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Build influxdb
      const influxdb = {
        image: `docker.registry.platform.sh/influxdb-${options.version}`,
        ports: [options.port],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
        },
        volumes: [
          `${options.data}:/mnt`,
        ],
      };

      // Add in the influxdb service and push downstream
      super(id, options, {services: _.set({}, options.name, influxdb)});
    };
  },
};
