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
    healthcheck: 'echo \'db.runCommand("ping").ok\' | mongo localhost:27017/test',
    port: '27017',
    remoteFiles: {
      database: '/bitnami/mongodb/conf/lando.conf',
    },
  },
  parent: '_service',
  builder: (parent, config) => class LandoMongoDb extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      const mongo = {
        image: `bitnami/mongodb:${options.version}`,
        command: '/entrypoint.sh /run.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          LANDO_NEEDS_EXEC: 'DOEEET',
          // MONGODB_EXTRA_FLAGS for things like coallation?
        },
        volumes: [
          `${options.data}:/bitnami`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, mongo)});
    };
  },
};
