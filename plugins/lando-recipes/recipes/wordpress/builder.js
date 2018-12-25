'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/utils');

// WPCLI
const wpCliUrl = 'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar';
const wpStatusCheck = ['php', '/tmp/wp-cli.phar', '--allow-root', '--info'];

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
    php: '7.2',
    services: {appserver: {overrides: {
      volumes: ['/var/www/.wp-cli'],
    }}},
    tooling: {wp: {service: 'appserver'}},
    via: 'apache',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoWordPress extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Add the wp cli install command
      options.build.unshift(utils.getPhar(wpCliUrl, '/tmp/wp-cli.phar', '/usr/local/bin/wp', wpStatusCheck));
      // Set the default vhosts if we are nginx
      if (_.startsWith(options.via, 'nginx')) options.defaultFiles.vhosts = 'default.conf.tpl';
      // Set the default mysql if we are there as well
      if (options.database !== 'postgres') options.defaultFiles.database = 'mysql.cnf';
      // Send downstream
      super(id, options);
    };
  },
};
