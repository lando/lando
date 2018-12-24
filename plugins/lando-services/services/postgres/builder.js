'use strict';

// Modules
const _ = require('lodash');

/*
 * Apache for all
 */
module.exports = {
  name: 'postgres',
  config: {
    version: '10.6.0',
    supported: ['11.1', '11.0', '10.6.0', '10', '9.6'],
    patchesSupported: true,
    confSrc: __dirname,
    creds: {
      database: 'database',
    },
    healthcheck: 'psql -U postgres -c "\\\l"',
    port: '5432',
    defaultFiles: {
      database: 'postgresql.conf',
    },
    remoteFiles: {
      database: '/opt/bitnami/postgresql/conf/postgresql.conf',
    },
  },
  parent: '_service',
  builder: (parent, config) => class LandoPostgres extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      const postgres = {
        image: `bitnami/postgresql:${options.version}`,
        command: '/app-entrypoint.sh /run.sh',
        environment: {
          POSTGRESQL_DATABASE: options.creds.database,
        },
        volumes: [
          `${options.confDest}/${options.defaultFiles.database}:${options.remoteFiles.database}`,
          `data_${options.name}:/bitnami`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, postgres)});
    };
  },
};
