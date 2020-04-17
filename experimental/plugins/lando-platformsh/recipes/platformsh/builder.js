'use strict';

// Modules
const _ = require('lodash');

/*
  name: 'platformsh',
  parent: '_lamp',
  config: {
    confSrc: __dirname,
    xdebug: false,
    webroot: 'web',
    database: 'mariadb:10.4',
    services: {
      appserver: {
        meUser: 'web',
        scanner: false,
        build_as_root_internal: [
          '/helpers/boot-psh.sh',
          '/etc/platform/boot',
        ],
        overrides: {
          privileged: true,
          image: 'docker.registry.platform.sh/php-7.4',
          command: 'init',
          environment: {
            LANDO_WEBROOT_USER: 'web',
            LANDO_WEBROOT_GROUP: 'web',
            LANDO_WEBROOT_UID: '10000',
            LANDO_WEBROOT_GID: '10000',
            LANDO_NEEDS_EXEC: 'DOEEET',
          },
        },
      },
    },
*/

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
    services: {
      appserver: {
        meUser: 'web',
        scanner: false,
        build_as_root_internal: [
          '/helpers/boot-psh.sh',
          '/etc/platform/boot &> /dev/null',
        ],
        overrides: {
          privileged: true,
          image: 'docker.registry.platform.sh/php-7.4',
          command: 'init',
          environment: {
            LANDO_WEBROOT_USER: 'web',
            LANDO_WEBROOT_GROUP: 'web',
            LANDO_WEBROOT_UID: '10000',
            LANDO_WEBROOT_GID: '10000',
            LANDO_NEEDS_EXEC: 'DOEEET',
          },
        },
      },
      database: {
        meUser: 'web',
        scanner: false,
        build_as_root_internal: [
          '/helpers/boot-psh.sh',
          '/etc/platform/boot &> /dev/null',
        ],
        overrides: {
          privileged: true,
          image: 'docker.registry.platform.sh/mariadb-10.4',
          command: 'init',
          environment: {
            LANDO_WEBROOT_USER: 'web',
            LANDO_WEBROOT_GROUP: 'web',
            LANDO_WEBROOT_UID: '10000',
            LANDO_WEBROOT_GID: '10000',
            LANDO_NEEDS_EXEC: 'DOEEET',
          },
        },
      },
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
