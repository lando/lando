'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/utils');

// Get install DC command
const dcInstall = utils.getPhar('https://drupalconsole.com/installer', '/tmp/drupal.phar', '/usr/local/bin/drupal');

/*
 * Build Drupal 8
 */
module.exports = {
  name: 'drupal8',
  parent: '_drupaly',
  config: {
    confSrc: __dirname,
    defaultFiles: {},
    php: '7.3',
    drupal: true,
  },
  builder: (parent, config) => class LandoDrupal8 extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Add in drupal console things
      if (options.drupal === true) {
        options.build = [dcInstall];
        options.tooling = {drupal: {
          service: 'appserver',
          description: 'Runs drupal console commands',
        }};
      }
      super(id, options);
    };
  },
};
