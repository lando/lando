'use strict';

// Modules
const _ = require('lodash');

// Get install DC command
// const utils = require('./../../lib/utils');
// const dcInstall = utils.getPhar('https://drupalconsole.com/installer', '/tmp/drupal.phar', '/usr/local/bin/drupal');

/*
 * Build Drupal 9
 */
module.exports = {
  name: 'drupal9',
  parent: '_drupaly',
  config: {
    confSrc: __dirname,
    defaultFiles: {},
    php: '7.4',
    drush: '^10',
  },
  builder: (parent, config) => class LandoDrupal9 extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Set drush to false
      options.drush = false;

      // Let's make sure we set appropripate default versions for things
      // See: https://www.drupal.org/docs/9/how-drupal-9-is-made-and-what-is-included/environment-requirements-of-drupal-9
      if (_.get(options, 'database') === 'mysql') {
        options.database = 'mysql:5.7';
      } else if (_.get(options, 'database') === 'mariadb') {
        options.database = 'mariadb:10.3';
      } else if (_.get(options, 'database') === 'postgres') {
        options.database = 'postgres:10';
      }

      // Send it downstream
      super(id, options);
    };
  },
};
