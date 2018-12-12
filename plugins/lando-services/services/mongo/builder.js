'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'mongo',
  config: {
    version: '4.0',
    supported: ['4.1', '4.0', '3.6'],
    patchesSupported: true,
    confSrc: __dirname,
    creds: {
      database: 'database',
    },
    port: '27017',
    defaultFiles: {
      config: 'mongodb.conf',
    },
    remoteFiles: {
      config: '/opt/bitnami/mongodb/conf/mongodb.conf',
    },
  },
  parent: '_service',
  builder: (parent, config) => class LandoMongoDb extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      const mongo = {
        image: `bitnami/mongodb:${options.version}`,
        command: '/app-entrypoint.sh /run.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          // MONGODB_EXTRA_FLAGS for things like coallation?
          MONGODB_DATABASE: options.creds.database,
        },
        volumes: [
          `${options.confDest}/${options.defaultFiles.config}:${options.remoteFiles.config}`,
          `data_${options.name}:/bitnami`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, mongo)});
    };
  },
};
