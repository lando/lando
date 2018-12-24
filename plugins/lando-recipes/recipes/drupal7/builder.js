'use strict';

// Modules
const _ = require('lodash');

// "Constants"
const DRUSH8 = '8.1.18';
const DRUSH7 = '7.4.0';

/*
 * Build Drupal 7
 */
module.exports = {
  name: 'drupal7',
  parent: '_drupaly',
  config: {
    confSrc: __dirname,
    database: 'mysql',
    defaultFiles: {
      php: 'php.ini',
    },
    php: '7.2',
    proxyService: 'appserver',
    via: 'apache',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoDrupal7 extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Set the default drush version if we don't have it
      if (!_.has(options, 'drush')) options.drush = (options.php === '5.3') ? DRUSH7 : DRUSH8;
      // Set the default vhosts if we are nginx
      if (options.via === 'nginx') config.defaultFiles.vhosts = 'default.conf.tpl';
      // Set the default mysql if we are there as well
      if (options.database !== 'postgres') config.defaultFiles.database = 'mysql.cnf';
      // Send downstream
      super(id, _.merge({}, config, options));
    };
  },
};
