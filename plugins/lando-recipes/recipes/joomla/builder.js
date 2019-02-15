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
      // Send downstream
      super(id, options);
    };
  },
};
