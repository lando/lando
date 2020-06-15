'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-php',
  config: {
    version: '7.4',
    supported: ['7.4', '7.3', '7.2', '7.1', '7.0', '5.6', '5.5', '5.4'],
    legacy: ['7.1', '7.0', '5.5', '5.4', '5.3'],
    confSrc: __dirname,
    volumes: ['/usr/local/bin'],
  },
  parent: '_platformsh_appserver',
  builder: (parent, config) => class LandoPlatformshPhp extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Build the php
      const php = {
        image: `docker.registry.platform.sh/php-${options.version}`,
        volumes: options.volumes,
        ports: ['80'],
      };

      // Add in the php service and push downstream
      super(id, options, {services: _.set({}, options.name, php)});
    };
  },
};
