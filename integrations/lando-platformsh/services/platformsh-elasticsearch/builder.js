'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-elasticsearch',
  config: {
    confSrc: __dirname,
    legacy: ['5.4', '5.2', '2.4', '1.7', '1.4', '0.9'],
    port: '9200',
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformsElasticsearch extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Set the meUser
      options.meUser = 'elasticsearch';
      // Build the elasticsearch
      const elasticsearch = {
        image: `docker.registry.platform.sh/elasticsearch-${options.version}`,
        ports: [options.port],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
        },
        volumes: [
          `${options.data}:/mnt`,
        ],
      };

      // Add in the elasticsearch service and push downstream
      super(id, options, {services: _.set({}, options.name, elasticsearch)});
    };
  },
};
