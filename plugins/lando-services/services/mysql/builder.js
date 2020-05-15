'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'mysql',
  config: {
    version: '5.7',
    supported: ['8.0', '5.7'],
    pinPairs: {
      '8.0': 'bitnami/mysql:8.0.19-debian-10-r57',
      '5.7': 'bitnami/mysql:5.7.29-debian-10-r51',
    },
    patchesSupported: true,
    authentication: 'caching_sha2_password',
    confSrc: __dirname,
    creds: {
      database: 'database',
      password: 'mysql',
      user: 'mysql',
    },
    healthcheck: 'mysql -uroot --silent --execute "SHOW DATABASES;"',
    port: '3306',
    defaultFiles: {
      database: 'my_custom.cnf',
    },
    remoteFiles: {
      database: '/opt/bitnami/mysql/conf/my_custom.cnf',
    },
  },
  parent: '_service',
  builder: (parent, config) => class LandoMySql extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Force the auth plugin to be mysql_native_password on 5.7
      if (_.startsWith(options.version, '5.7')) {
        options.authentication = 'mysql_native_password';
      }
      // If we can ensure an up to date version lets use a better healthcheck
      if (_.includes(['8.0', '5.7'], options.version)) {
        options.healthcheck = 'bash -c "[ -f /bitnami/mysql/.mysql_initialized ]"';
      }
      // Ensure the non-root backup perm sweep runs
      // NOTE: we guard against cases where the UID is the same as the bitnami non-root user
      // because this messes things up on circle ci and presumably elsewhere and _should_ be unncessary
      if (_.get(options, '_app._config.uid', '1000') !== '1001') options._app.nonRoot.push(options.name);

      // Build the default stuff here
      const mysql = {
        image: `bitnami/mysql:${options.version}`,
        command: '/launch.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          MYSQL_AUTHENTICATION_PLUGIN: options.authentication,
          MYSQL_DATABASE: options.creds.database,
          MYSQL_PASSWORD: options.creds.password,
          MYSQL_USER: options.creds.user,
          LANDO_NEEDS_EXEC: 'DOEEET',
        },
        volumes: [
          `${options.confDest}/launch.sh:/launch.sh`,
          `${options.confDest}/${options.defaultFiles.database}:${options.remoteFiles.database}`,
          `${options.data}:/bitnami/mysql/data`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, mysql)});
    };
  },
};
