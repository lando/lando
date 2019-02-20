'use strict';

// Modules
const _ = require('lodash');

/*
 * Build Drupal 7
 */
module.exports = {
  name: 'joomla',
  parent: '_lamp',
  config: {
    composer: {},
    confSrc: __dirname,
    config: {},
    database: 'mysql',
    defaultFiles: {
      php: 'php.ini',
    },
    php: '7.2',
    tooling: {joomla: {service: 'appserver'}},
    via: 'apache',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoJoomla extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Add the joomla cli install command
      options.composer['joomlatools/console'] = '*';
      // Set the default vhosts if we are nginx
      if (_.startsWith(options.via, 'nginx')) options.defaultFiles.vhosts = 'default.conf.tpl';
      // Set the default mysql if we are there as well
      if (!_.startsWith(options.database, 'postgres')) options.defaultFiles.database = 'mysql.cnf';
      // Send downstream
      super(id, options);
    };
  },
};
