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
    version: '10.2',
    supported: ['10.2', '10.1'],
    legacy: [],
    // Config
    confSrc: __dirname,
    defaultFiles: {
      config: path.join(__dirname, 'lando.cnf'),
    },
    remoteFiles: {
      config: '/opt/bitnami/mariadb/conf/lando.cnf',
    },
  },
  parent: '_database',
  builder: (parent, config) => class LandoMariaDb extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Build the default stuff here
      const mariadb = {
        image: `bitnami/mariadb:${options.version}`,
        command: '/entrypoint.sh /run.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          // MARIADB_EXTRA_FLAGS for things like coallation?
          MARIADB_DATABASE: 'database',
          MARIADB_PASSWORD: 'password',
          MARIADB_USER: 'mariadb',
        },
        healthcheck: {
          test: 'mysql -uroot --silent --execute "SHOW DATABASES;"',
          interval: '2s',
          timeout: '10s',
          retries: 25,
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

/*
    // Handle port forwarding
    if (config.portforward) {
      // If true assign a port automatically
      if (config.portforward === true) {
        mariadb.ports = ['3306'];
      } else {
        mariadb.ports = [config.portforward + ':3306'];
      }
    }
    */
