'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-solr',
  config: {
    confSrc: __dirname,
    port: '8080',
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshSolr extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Set the meUser
      options.meUser = 'app';
      // Make sure we get a localhost assignment for 8080
      options.moreHttpPorts = ['8080'];

      // Build the solr
      const solr = {
        image: `docker.registry.platform.sh/solr-${options.version}`,
        ports: [options.port],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
        },
        volumes: [
          `${options.data}:/mnt`,
        ],
      };

      // Add in the solr service and push downstream
      super(id, options, {services: _.set({}, options.name, solr)});
    };
  },
};
