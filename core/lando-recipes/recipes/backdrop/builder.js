'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/utils');

/*
 * Helper to return backdrop settings
 */
const backdropSettings = () => JSON.stringify({
  databases: {
    default: {
      default: {
        driver: 'mysql',
        database: 'backdrop',
        username: 'backdrop',
        password: 'backdrop',
        host: 'database',
        port: 3306,
      },
    },
  },
});

/*
 * Helper to return backdrush download url
 */
const backdrushUrl = version =>
  `https://github.com/backdrop-contrib/backdrop-drush-extension/archive/${version}.tar.gz`;


/*
 * Get backdrush install command
 */
const backdrushInstall = version => [
  'mkdir -p', '~/.drush', '&&',
  'curl', '-fsSL', backdrushUrl(version), '|', 'tar', '-xz', '--strip-components=1', '-C', '~/.drush', '&&',
  'drush', 'cc', 'drush',
].join(' ');

/*
 * Build Backdrop
 */
module.exports = {
  name: 'backdrop',
  parent: '_drupaly',
  config: {
    backdrush: '1.4.0',
    build: [],
    confSrc: __dirname,
    defaultFiles: {},
    drush: '8.3.5',
    php: '7.2',
    services: {appserver: {overrides: {
      environment: {
        BACKDROP_SETTINGS: backdropSettings(),
      },
    }}},
  },
  builder: (parent, config) => class LandoBackdrop extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // If this is an unsupported version lets add a CLI container as well
      if (options.php === '5.3' || options.php === 5.3) {
        options.services.appserver_cli = _.merge({}, options.services.appserver, {
          type: 'php:5.5',
          via: 'cli',
          overrides: {image: 'devwithlando/php:5.5-fpm'},
          build_internal: [
            utils.getDrush(options.drush, ['drush', '--version']),
            backdrushInstall(options.backdrush),
          ],
        });
        // Remove drush from appserver proper
        options.drush = false;
        // Override some tooling things
        options.tooling = {drush: {service: 'appserver_cli'}};
      // Add in backdrush install command normally
      } else {
        options.build.push(backdrushInstall(options.backdrush));
      }
      super(id, options);
    };
  },
};
