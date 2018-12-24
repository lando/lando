'use strict';

// Modules
const _ = require('lodash');

/*
 * Build Drupal 6
 */
module.exports = {
  name: 'drupal6',
  parent: '_drupaly',
  config: {
    confSrc: __dirname,
    defaultFiles: {},
    php: '5.6',
  },
  builder: (parent, config) => class LandoDrupal6 extends parent {
    constructor(id, options = {}) {
      super(id, _.merge({}, config, options));
    };
  },
};
