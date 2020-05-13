'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'mongo',
  config: {
    version: '4.2',
    supported: ['4.2', '4.1', '4.0', '3.6'],
    legacy: ['4.1'],
    pinPairs: {
      '4.2': 'bitnami/mongodb:4.2.6-debian-10-r33',
      '4.1': 'bitnami/mongodb:4.1.13-debian-9-r96',
      '4.0': 'bitnami/mongodb:4.0.13-debian-9-r45',
      '3.6': 'bitnami/mongodb:3.6.16-debian-9-r41',
    },
    patchesSupported: true,
    confSrc: __dirname,
    healthcheck: ['mongo', 'tests', '--eval', 'db.runCommand("ping").ok'],
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
        command: '/launch.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          LANDO_NEEDS_EXEC: 'DOEEET',
          // MONGODB_EXTRA_FLAGS for things like coallation?
        },
        volumes: [
          `${options.confDest}/launch.sh:/launch.sh`,
          `${options.data}:/bitnami`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, mongo)});
    };
  },
};
