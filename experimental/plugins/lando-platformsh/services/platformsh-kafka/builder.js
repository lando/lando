'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-kafka',
  config: {
    confSrc: __dirname,
    port: '9092',
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshKafka extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Set the meUser
      options.meUser = 'app';

      // Build kafka
      const kafka = {
        image: `docker.registry.platform.sh/kafka-${options.version}`,
        ports: [options.port],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
        },
      };

      // Add in the kafka service and push downstream
      super(id, options, {services: _.set({}, options.name, kafka)});
    };
  },
};
