'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

// Path
const LANDO_PATH = [
  // BUILD deps
  '/app/.platform/local/deps/nodejs/node_modules/.bin',
  '/app/.platform/local/deps/php/vendor/bin',
  // /app/.platform/local/deps/python
  '/app/.platform/local/deps/ruby/bin',
  // GLOBAL things
  '/var/www/.platform/bin',
  '/var/www/.platformsh/bin',
  '/var/www/.composer/vendor/bin',
  '/app/vendor/bin',
  '/app/bin',
  '/usr/local/sbin',
  '/usr/local/bin',
  '/usr/sbin',
  '/usr/bin',
  '/sbin',
  '/bin',
];

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_platformsh_appserver',
  parent: '_lando',
  builder: parent => class LandoPlatformAppserver extends parent {
    constructor(id, options = {}, ...sources) {
      // Get some stuff from our parsed platform config
      const runConfigPath = _.get(options, 'runConfig.file');
      const runConfig = _.find(options.runConfig.data.applications, app => {
        return app.configuration.name === options.name;
      });
      const bootScript = path.join(options.userConfRoot, 'scripts', 'psh-boot.sh');

      // A appserver uses the "web" user
      options.meUser = 'web';
      // Find the envvars we need to set
      // We also set these here so SOME of them are available during build
      const environment = _.get(runConfig, 'configuration.variables', {});

      // Set the docker things we need for all appservers
      sources.push({services: _.set({}, options.name, {
        command: 'exec init',
        environment: _.merge({}, environment, {
          CLICOLOR_FORCE: 1,
          COMPOSER_HOME: '/var/www/.composer',
          LANDO_NO_USER_PERMS: 'NOTGONNADOIT',
          LANDO_SERVICE_TYPE: '_platformsh_appserver',
          LANDO_SOURCE_DIR: options.platformsh.sourceDir,
          LANDO_WEBROOT_USER: 'web',
          LANDO_WEBROOT_GROUP: 'web',
          LANDO_BUILD_DESTINATION: _.get(options, 'platformsh.webroot', '/app'),
          PATH: LANDO_PATH.join(':'),
          PLATFORMSH_CLI_HOME: '/var/www',
          PLATFORMSH_CLI_TOKEN: _.get(options, '_app.meta.token'),
          PLATFORMSH_CLI_SHELL_CONFIG_FILE: '/var/www/.bashrc',
          PLATFORMSH_CLI_UPDATES_CHECK: 0,
        }),
        privileged: true,
        volumes: [
          `${runConfigPath}:/run/config.json`,
          `${bootScript}:/scripts/001-boot-platformsh`,
        ],
        working_dir: '/app',
      })});

      // Pass down
      super(id, options, ...sources);
    };
  },
};
