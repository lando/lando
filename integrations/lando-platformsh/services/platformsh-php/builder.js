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
        .thru(routes => !_.isEmpty(routes) ? routes[0].url : undefined)
        .value();
      // Get the remote host
      const hostIP = _.get(options, 'runConfig.data.host_ip', 'host.docker.internal');

      // Build the php
      const php = {
        image: `docker.registry.platform.sh/php-${options.version}`,
        volumes: options.volumes,
        ports: ['80'],

        // Set xdebug things, should be safe to set these regardless of whether
        // the extensions is enabled or not, should also be safe to mix xdebug2
        // and xdebug3
        environment: {
          XDEBUG_CONFIG: `client_host=${hostIP} remote_host=${hostIP}`,
          PHP_IDE_CONFIG: `serverName=${options.name}`,
        },
      };

      // Add some stuff if we have a primary route
      if (primaryRoute) php.environment.DRUSH_OPTIONS_URI = primaryRoute;

      // Add in the php service and push downstream
      super(id, options, {services: _.set({}, options.name, php)});
    };
  },
};
