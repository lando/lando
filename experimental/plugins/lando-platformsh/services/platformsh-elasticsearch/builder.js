'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

// Builder
module.exports = {
  name: 'platformsh-elasticsearch',
  config: {
    version: '7.2',
    supported: ['7.2', '7.7', '6.5', '5.4', '5.2', '2.4', '1.7', '1.4', '0.9'],
    legacy: ['5.4', '5.2', '2.4', '1.7', '1.4', '0.9'],
    confSrc: __dirname,
    port: '9200',
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
      };

      // Add in the elasticsearch service and push downstream
      super(id, options, {services: _.set({}, options.name, elasticsearch)});
    };
  },
};
