'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../../lando-core/lib/utils');

// Builder
module.exports = {
  name: 'compose',
  config: {
    version: 'custom',
    services: {},
    networks: {},
    volumes: {},
  },
  parent: '_lando',
  builder: (parent, config) => class LandoCompose extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      super(id, options, {
        services: _.set(
          {},
          options.name,
          utils.normalizeOverrides(options.services, options._app.root, options.volumes)
        ),
        networks: options.networks,
        volumes: options.volumes,
      });
    };
  },
};
