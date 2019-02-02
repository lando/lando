'use strict';

// Modules
const _ = require('lodash');

/*
 * Apache for all
 */
module.exports = {
  name: 'postgres',
  config: {
    version: '10',
    supported: ['11', '11.1', '11.0', '10', '10.6.0', '9.6'],
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
      database: '/bitnami/postgresql/conf/conf.d/lando.conf',
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
          POSTGRES_DB: options.creds.database,
          LANDO_WEBROOT_UID: '1001',
          LANDO_WEBROOT_GID: '1001',
        },
        volumes: [
          `${options.confDest}/${options.defaultFiles.database}:${options.remoteFiles.database}`,
          `${options.data}:/bitnami`,
        ],
      };
      options.meUser = '1001';
      // The Bitnami Postgres container is particular about the user/pass.
      options.creds.user = 'postgres';
      options.creds.password = '';
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, postgres)});
    };
  },
};
