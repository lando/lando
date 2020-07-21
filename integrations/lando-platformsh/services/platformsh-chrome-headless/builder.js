'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-chrome-headless',
  config: {
    confSrc: __dirname,
    port: '9222',
    supportedIgnore: true,
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshChromeHeadless extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Build chrome-headless
      const chromeHeadless = {
        image: `docker.registry.platform.sh/chrome-headless-${options.version}`,
        ports: [options.port],
        environment: {
          LANDO_WEBROOT_USER: options.meUser,
          LANDO_WEBROOT_GROUP: options.meUser,
        },
      };

      // Add in the chrome-headless service and push downstream
      super(id, options, {services: _.set({}, options.name, chromeHeadless)});
    };
  },
};
