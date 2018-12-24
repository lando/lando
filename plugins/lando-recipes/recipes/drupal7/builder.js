'use strict';

// Modules
const _ = require('lodash');

/*
 * Build Drupal 7
 */
module.exports = {
  name: 'drupal7',
  parent: '_drupaly',
  config: {
    confSrc: __dirname,
    defaultFiles: {},
    php: '7.2',
  },
  builder: (parent, config) => class LandoDrupal7 extends parent {
    constructor(id, options = {}) {
      super(id, _.merge({}, config, options));
    };
  },
};
