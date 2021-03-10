'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'mariadb',
  config: {
    version: '10.3',
    supported: ['10.5', '10.4', '10.3', '10.2', '10.1'],
    pinPairs: {
      '10.5': 'bitnami/mariadb:10.5.8-debian-10-r74',
      '10.4': 'bitnami/mariadb:10.4.17-debian-10-r84',
      '10.3': 'bitnami/mariadb:10.3.27-debian-10-r84',
      '10.2': 'bitnami/mariadb:10.2.36-debian-10-r83',
      '10.1': 'bitnami/mariadb:10.1.47-debian-10-r13',
    },
    patchesSupported: true,
    confSrc: __dirname,
    creds: {
      database: 'database',
      password: 'mariadb',
      user: 'mariadb',
    },
    healthcheck: 'mysql -uroot --silent --execute "SHOW DATABASES;"',
    port: '3306',
    defaultFiles: {
      database: 'my_custom.cnf',
    },
    remoteFiles: {
      database: '/opt/bitnami/mariadb/conf/my_custom.cnf',
    },
  },
  parent: '_service',
  builder: (parent, config) => class LandoMariaDb extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Ensure the non-root backup perm sweep runs
      // NOTE: we guard against cases where the UID is the same as the bitnami non-root user
      // because this messes things up on circle ci and presumably elsewhere and _should_ be unncessary
      if (_.get(options, '_app._config.uid', '1000') !== '1001') options._app.nonRoot.push(options.name);

      const mariadb = {
        image: `bitnami/mariadb:${options.version}`,
        command: '/launch.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          // MARIADB_EXTRA_FLAGS for things like coallation?
          MARIADB_DATABASE: options.creds.database,
          MYSQL_DATABASE: options.creds.database,
          MARIADB_PASSWORD: options.creds.password,
          MARIADB_USER: options.creds.user,
          LANDO_NEEDS_EXEC: 'DOEEET',
        },
        volumes: [
          `${options.confDest}/launch.sh:/launch.sh`,
          `${options.confDest}/${options.defaultFiles.database}:${options.remoteFiles.database}`,
          `${options.data}:/bitnami/mariadb`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, mariadb)});
    };
  },
};
