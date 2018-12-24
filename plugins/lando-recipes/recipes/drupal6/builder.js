'use strict';

// Modules
const _ = require('lodash');
const LandoDrupal7 = require('./../drupal7/builder.js');

/*
 * Build Drupal 7
 */
module.exports = {
  name: 'drupal6',
  parent: '_drupaly',
  config: {
    confSrc: __dirname,
    php: '5.6',
    defaultFiles: {},
  },
  builder: (parent, config) => class LandoDrupal6 extends LandoDrupal7.builder(parent, config) {
    constructor(id, options = {}) {
      super(id, _.merge({}, config, options));
    };
  },
};
