'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-rabbitmq',
  config: {
    confSrc: __dirname,
    port: '5672',
    httpPort: '15672',
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshRabbitmq extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      options.moreHttpPorts = [options.httpPort];

      // Build rabbitmq
      const rabbitmq = {
        image: `docker.registry.platform.sh/rabbitmq-${options.version}`,
        ports: [options.port, options.httpPort],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
        },
        volumes: [
          `${options.data}:/mnt`,
        ],
      };

      // Add in the rabbitmq service and push downstream
      super(id, options, {services: _.set({}, options.name, rabbitmq)});
    };
  },
};
