'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * Apache for all
 */
module.exports = {
  name: 'mariadb',
  config: {
    // Versions
    version: '10.1',
    supported: ['10.2', '10.1'],
    patchesSupported: true,
    legacy: [],
    // Config
    confSrc: __dirname,
    creds: {
      database: 'database',
      password: 'mariadb',
      user: 'mariadb',
    },
    healthcheck: 'mysql -uroot --silent --execute "SHOW DATABASES;"',
    port: '3306',
    defaultFiles: {
      config: path.join(__dirname, 'lando.cnf'),
    },
    remoteFiles: {
      config: '/opt/bitnami/mariadb/conf/my_custom.cnf',
    },
  },
  parent: '_database',
  builder: (parent, config) => class LandoMariaDb extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      const mariadb = {
        image: `bitnami/mariadb:${options.version}`,
        command: '/entrypoint.sh /run.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          // MARIADB_EXTRA_FLAGS for things like coallation?
          MARIADB_DATABASE: options.creds.database,
          MARIADB_PASSWORD: options.creds.password,
          MARIADB_USER: options.creds.user,
        },
        volumes: [
          `${options.defaultFiles.config}:${options.remoteFiles.config}`,
          `data_${options.name}:/bitnami/mariadb`,
        ],
      };
      // Send it downstream
      super(id, options, {
        services: _.set({}, options.name, mariadb),
        volumes: _.set({}, `data_${options.name}`, {}),
      });
    };
  },
};
