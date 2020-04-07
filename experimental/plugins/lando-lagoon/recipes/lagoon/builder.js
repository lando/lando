'use strict';

// Modules
const _ = require('lodash');

/*
 * Build Lagoon
 */
module.exports = {
  name: 'lagoon',
  parent: '_lamp',
  config: {
    confSrc: __dirname,
    flavor: 'drupal',
    services: {appserver: {overrides: {
      volumes: [],
    }}},
    xdebug: false,
    webroot: '.',
  },
  builder: (parent, config) => class LandoLagoon extends parent {
    constructor(id, options = {}) {
      // Merge in pantheon ymlz
      options = _.merge({}, config, options);
      // Send downstream
      super(id, options);
    };
  },
};
