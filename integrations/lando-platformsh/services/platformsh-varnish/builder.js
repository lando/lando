'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-varnish',
  config: {
    confSrc: __dirname,
    port: '8080',
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshVarnish extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      options.moreHttpPorts = ['8081'];

      // Build varnish
      const varnish = {
        image: `docker.registry.platform.sh/varnish-${options.version}`,
        ports: ['8080', '8081'],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
        },
      };

      // Add in the varnish service and push downstream
      super(id, options, {services: _.set({}, options.name, varnish)});
    };
  },
};
