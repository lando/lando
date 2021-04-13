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
    // @NOTE: below seems to be the last known drush version that let you do
    // drush si -y succesfully
    drush: '8.4.5',
  },
  builder: (parent, config) => class LandoDrupal6 extends parent {
    constructor(id, options = {}) {
      super(id, _.merge({}, config, options));
    };
  },
};
