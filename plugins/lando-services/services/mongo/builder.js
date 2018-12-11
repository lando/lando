'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

// Builder
module.exports = {
  name: 'mongo',
  config: {
    version: '4.0',
    supported: ['4.1', '4.0', '3.6'],
    patchesSupported: true,
    legacy: [],
    confSrc: __dirname,
    creds: {
      database: 'database',
    },
    port: '27017',
    defaultFiles: {
      config: path.join(__dirname, 'mongodb.conf'),
    },
    remoteFiles: {
      config: '/opt/bitnami/mongodb/conf/mongodb.conf',
    },
  },
  parent: '_database',
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
          `${options.defaultFiles.config}:${options.remoteFiles.config}`,
          `data_${options.name}:/bitnami`,
        ],
      };
      // Send it downstream
      super(id, options, {
        services: _.set({}, options.name, mongo),
        volumes: _.set({}, `data_${options.name}`, {}),
      });
    };
  },
};
