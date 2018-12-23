'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const semver = require('semver');
const utils = require('./../../lib/utils');

// "Constants"
const DRUSH8 = '8.1.18';
const DRUSH7 = '7.4.0';

/*
 * Helper to get DRUSH 8 or DRUSH LAUNCHER phar
 */
const drushUrl = (version = DRUSH8) => `https://github.com/drush-ops/drush/releases/download/${version}/drush.phar`;

/*
 * Helper to get the phar build command
 */
const pharOut = (url, status) => utils.getPhar(url, '/tmp/drush.phar', '/usr/local/bin/drush', status);

/*
 * Build Drupal 7
 */
module.exports = {
  name: 'drupal7',
  parent: '_lamp',
  config: {
    composer: {},
    confSrc: __dirname,
    config: {},
    database: 'mysql',
    php: '7.2',
    proxyService: 'appserver',
    services: {},
    tooling: {},
    via: 'apache',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoDrupal7 extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Set the default drush version if we don't have it
      if (!_.has(options, 'drush')) options.drush = (options.php === '5.3') ? DRUSH7 : DRUSH8;
      // Add drush to the tooling
      options.tooling.drush = {
        service: 'appserver',
        description: 'Run drush commands',
      };
      // Add drush cache to volumes
      options.services = {appserver: {overrides: {
        volumes: ['/var/www/.drush'],
      }}};
      // Add the drush install command
      if (!_.isNull(semver.valid(options.drush)) && semver.major(options.drush) === 8) {
        const installCmd = pharOut(drushUrl(options.drush), ['/tmp/drush.phar', 'core-status']);
        options.services.appserver.build_internal = [installCmd];
      } else {
        options.composer['drush/drush'] = options.drush;
      }
      // Switch the proxy if needed and then set it
      if (options.via === 'nginx') options.proxyService = 'appserver_nginx';
      options.proxy = _.set({}, options.proxyService, [`${options.app}.${options._app._config.domain}`]);
      // Set our config defaults if we dont have them and it makes sense
      if (!_.has(options, 'config.php')) options.config.php = path.join(options.confDest, 'php.ini');
      if (!_.has(options, 'config.database') && options.database !== 'postgres') {
        options.config.database = path.join(options.confDest, 'mysql.cnf');
      }
      if (!_.has(options, 'config.vhosts') && options.via === 'nginx') {
        options.config.vhosts = path.join(options.confDest, 'default.conf.tpl');
      }
      super(id, _.merge({}, config, options));
    };
  },
};
