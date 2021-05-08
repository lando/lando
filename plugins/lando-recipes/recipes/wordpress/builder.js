'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/utils');

// WP status check
const getWpStatusCheck = (version = '7.4') => {
  if (version === '5.3') return ['true'];
  else return ['php', '/usr/local/bin/wp', '--info'];
};

// Helper to get WPCLI version
const getWpCliUrl = (version = '7.4') => {
  if (version === '5.3') return 'https://github.com/wp-cli/wp-cli/releases/download/v1.5.1/wp-cli-1.5.1.phar';
  else return 'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar';
};

/*
 * Build WordPress
 */
module.exports = {
  name: 'wordpress',
  parent: '_lamp',
  config: {
    build: [],
    confSrc: __dirname,
    config: {},
    database: 'mysql',
    defaultFiles: {
      php: 'php.ini',
    },
    php: '7.4',
    tooling: {wp: {service: 'appserver'}},
    via: 'apache',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoWordPress extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Add the wp cli install command
      options.build.unshift(utils.getPhar(
        getWpCliUrl(options.version),
        '/tmp/wp-cli.phar',
        '/usr/local/bin/wp',
        getWpStatusCheck(options.version)
      ));
      // Send downstream
      super(id, options);
    };
  },
};
