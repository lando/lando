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
    port: '27017',
    defaultFiles: {
      database: 'mongodb.conf',
    },
    remoteFiles: {
      database: '/opt/bitnami/mongodb/conf/mongodb.conf',
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
        },
        volumes: [
          `${options.confDest}/${options.defaultFiles.database}:${options.remoteFiles.database}`,
          `data_${options.name}:/bitnami`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, mongo)});
    };
  },
};
