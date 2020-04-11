'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/*
 * Build Lagoon
 */
module.exports = {
  name: 'platformsh',
  parent: '_lamp',
  config: {
    confSrc: __dirname,
    xdebug: false,
    webroot: 'web',
    database: 'mariadb:10.4',
    run_root: [
      '/etc/platform/commands/open < /tmp/open.json',
      'chmod 777 -Rv /tmp/log/',
      'chmod 777 -Rv /run',
    ],
    services: {
      appserver: {
        meUser: 'web',
        scanner: false,
        overrides: {
          privileged: true,
          image: 'docker.registry.platform.sh/php-7.4',
          user: 'root',
          command: 'tail -f /dev/null',
          environment: {
            LANDO_WEBROOT_USER: 'web',
            LANDO_WEBROOT_GROUP: 'web',
            LANDO_WEBROOT_UID: '10000',
            LANDO_WEBROOT_GID: '10000',
          }
        }
      }
    },
  },
  builder: (parent, config) => class LandoPlatform extends parent {
    constructor(id, options = {}) {
      // Get our options
      options = _.merge({}, config, options);

      // Let's hardcode a basic example that just runs a php service
      // process.exit(1);
      // Send downstream
      super(id, options);
    };
  },
};
