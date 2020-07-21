'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-php',
  config: {
    confSrc: __dirname,
    legacy: ['7.1', '7.0', '5.5', '5.4', '5.3'],
    supportedIgnore: true,
    volumes: ['/usr/local/bin', '/mnt'],
  },
  parent: '_platformsh_appserver',
  builder: (parent, config) => class LandoPlatformshPhp extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      // Get route for this service
      const primaryRoute = _(_.get(options, '_app.platformsh.routes', []))
        .map((config, url) => _.merge({}, config, {url}))
        .filter(route => route.type === 'upstream')
        .filter(route => route.upstream.split(':')[0] === options.name)
        .orderBy('primary', ['desc'])
        .thru(routes => routes[0].url)
        .value();
      // Build the php
      const php = {
        image: `docker.registry.platform.sh/php-${options.version}`,
        volumes: options.volumes,
        ports: ['80'],
        environment: {
          DRUSH_OPTIONS_URI: primaryRoute,
        },
      };

      // Add in the php service and push downstream
      super(id, options, {services: _.set({}, options.name, php)});
    };
  },
};
