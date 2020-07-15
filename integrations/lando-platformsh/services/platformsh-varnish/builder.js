'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-varnish',
  config: {
    confSrc: __dirname,
    moreHttpPorts: ['8080', '8081'],
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshVarnish extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Build varnish
      const varnish = {
        image: `docker.registry.platform.sh/varnish-${options.version}`,
        ports: options.moreHttpPorts,
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
