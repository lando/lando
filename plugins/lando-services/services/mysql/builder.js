'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'mysql',
  config: {
    version: '5.7',
    supported: ['8.0', '5.7'],
    patchesSupported: true,
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
      // Build the default stuff here
      const mysql = {
        image: `bitnami/mysql:${options.version}`,
        command: '/entrypoint.sh /run.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          MYSQL_DATABASE: options.creds.database,
          MYSQL_PASSWORD: options.creds.password,
          MYSQL_USER: options.creds.user,
          LANDO_NEEDS_EXEC: 'DOEEET',
        },
        user: 'root',
        volumes: [
          `${options.confDest}/${options.defaultFiles.database}:${options.remoteFiles.database}`,
          `${options.data}:/bitnami/mysql/data`,
          `${options.confDest}/mysql-flush.sh:/helpers/mysql-flush.sh`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, mysql)});
    };
  },
};
