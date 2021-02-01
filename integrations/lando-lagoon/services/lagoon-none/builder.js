'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'lagoon-none',
  config: {
    version: 'custom',
    confSrc: __dirname,
  },
  parent: '_compose',
  builder: (parent, config) => class LandoLagoonNone extends parent {
    constructor(id, options = {}, factory) {
      // Merge
      options = _.merge({}, config, options);
      // Add in the php service and push downstream
      super(id, options, {services: _.set({}, options.name, options.lagoon)});
    };
  },
};
