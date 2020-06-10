'use strict';

// Modules
const _ = require('lodash');
const LandoLaemp = require('./../laemp/builder.js');
const semver = require('semver');
const utils = require('./../../lib/utils');
const warnings = require('./../../lib/warnings');

// "Constants"
const DRUSH8 = '8.3.2';
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

      // Attempt to suss out the drush version
      const drushVersion = semver.valid(semver.coerce(options.drush));

      // Add the drush install command
      if (!_.isNull(drushVersion) && semver.major(drushVersion) === 8) {
        options.build.unshift(utils.getDrush(options.drush, ['drush', '--version']));
      } else if (options.drush !== false) {
        options.composer['drush/drush'] = options.drush;
      }
      // Throw a warning to indicate site install pref for drush 10
      if (!_.isNull(drushVersion) && semver.gte(drushVersion, '10.0.0')) {
        options._app.addWarning(warnings.drushWarn(options.drush));
      }

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
