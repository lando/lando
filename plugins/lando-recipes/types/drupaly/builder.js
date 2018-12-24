'use strict';

// Modules
const _ = require('lodash');
const LandoLaemp = require('./../laemp/builder.js');
const semver = require('semver');
const utils = require('./../../lib/utils');

// "Constants"
const DRUSH8 = '8.1.18';
const DRUSH7 = '7.4.0';

/*
 * Helper to get DRUSH 8 or DRUSH LAUNCHER phar
 */
const drushUrl = version => `https://github.com/drush-ops/drush/releases/download/${version}/drush.phar`;

/*
 * Helper to get the phar build command
 */
const pharOut = (url, status) => utils.getPhar(url, '/tmp/drush.phar', '/usr/local/bin/drush', status);

/*
 * Build Drupal 7
 */
module.exports = {
  name: '_drupaly',
  parent: '_recipe',
  config: {
    build: [],
    composer: {},
    confSrc: __dirname,
    config: {},
    database: 'mysql',
    defaultFiles: {
      php: 'php.ini',
    },
    php: '7.2',
    proxyService: 'appserver',
    services: {appserver: {overrides: {
      volumes: ['/var/www/.drush'],
    }}},
    tooling: {drush: {
      service: 'appserver',
      description: 'Run drush commands',
    }},
    via: 'apache',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoDrupal extends LandoLaemp.builder(parent, config) {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Set the default drush version if we don't have it
      if (!_.has(options, 'drush')) options.drush = (options.php === '5.3') ? DRUSH7 : DRUSH8;
      // Add the drush install command
      if (!_.isNull(semver.valid(options.drush)) && semver.major(options.drush) === 8) {
        options.build.unshift(pharOut(drushUrl(options.drush), ['/tmp/drush.phar', 'core-status']));
      } else {
        options.composer['drush/drush'] = options.drush;
      }
      // Set the default vhosts if we are nginx
      if (options.via === 'nginx') config.defaultFiles.vhosts = 'default.conf.tpl';
      // Set the default mysql if we are there as well
      if (options.database !== 'postgres') config.defaultFiles.database = 'mysql.cnf';
      // Switch the proxy if needed and then set it
      if (options.via === 'nginx') options.proxyService = 'appserver_nginx';
      options.proxy = _.set({}, options.proxyService, [`${options.app}.${options._app._config.domain}`]);
      // Send downstream
      super(id, options);
    };
  },
};
