'use strict';

// Modules
const _ = require('lodash');
const LandoLaemp = require('./../laemp/builder.js');
const semver = require('semver');
const utils = require('./../../lib/utils');
const warnings = require('./../../lib/warnings');

// "Constants"
const DRUSH8 = '8.4.8';
const DRUSH7 = '7.4.0';

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
    tooling: {drush: {
      service: 'appserver',
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

      // Figure out the drush situation
      if (options.drush !== false) {
        // Start by assuming a composer based install
        options.composer['drush/drush'] = options.drush;
        // Switch to phar based install if we can
        if (semver.valid(options.drush) && semver.major(options.drush) === 8) {
          delete options.composer['drush/drush'];
          options.build.unshift(utils.getDrush(options.drush, ['drush', '--version']));
        }
        // Attempt to set a warning if possible
        const coercedDrushVersion = semver.valid(semver.coerce(options.drush));
        if (!_.isNull(coercedDrushVersion) && semver.gte(coercedDrushVersion, '10.0.0')) {
          options._app.addWarning(warnings.drushWarn(options.drush));
        }
      }

      // Merge in what we have for proxy settings so we can pass them downstream
      options.proxy = _.merge({}, options.proxy);
      // Set legacy envars
      options.services = _.merge({}, options.services, {appserver: {overrides: {
        environment: {
          SIMPLETEST_BASE_URL: (options.via === 'nginx') ? 'https://appserver_nginx' : 'https://appserver',
          SIMPLETEST_DB: `mysql://${options.recipe}:${options.recipe}@database/${options.recipe}`,
        },
      }}});
      // Send downstream
      super(id, options);
    };
  },
};
