'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

// Path
const LANDO_PATH = [
  '/app/vendor/bin',
  '/usr/local/sbin',
  '/usr/local/bin',
  '/usr/sbin',
  '/usr/bin',
  '/sbin',
  '/bin',
  // GLOBAL things
  '/var/www/.platform/bin',
  '/var/www/.platformsh/bin',
  '/var/www/.composer/vendor/bin',
  // BUILD deps
  '/app/.platform/local/deps/nodejs/node_modules/.bin',
  '/app/.platform/local/deps/php/vendor/bin',
  // /app/.platform/local/deps/python
  '/app/.platform/local/deps/ruby/bin',
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
      const bootScript = path.join(options.userConfRoot, 'scripts', 'psh-boot.sh');

      // A appserver uses the "web" user
      options.meUser = 'web';
      // Remove the normal lando mount so we can handle multiapp
      // mounts which mount subdirs of rootDir in /app
      options.app_mount = false;

      // Set the docker things we need for all appservers
      sources.push({services: _.set({}, options.name, {
        command: 'exec init',
        environment: {
          CLICOLOR_FORCE: 1,
          COMPOSER_HOME: '/var/www/.composer',
          LANDO_NO_USER_PERMS: 'NOTGONNADOIT',
          LANDO_SERVICE_TYPE: '_platformsh_appserver',
          LANDO_WEBROOT_USER: 'web',
          LANDO_WEBROOT_GROUP: 'web',
          PATH: LANDO_PATH.join(':'),
          PLATFORMSH_CLI_HOME: '/var/www',
          PLATFORMSH_CLI_TOKEN: _.get(options, '_app.meta.token'),
          PLATFORMSH_CLI_SHELL_CONFIG_FILE: '/var/www/.bashrc',
        },
        privileged: true,
        volumes: [
          `${runConfigPath}:/run/config.json`,
          `${bootScript}:/scripts/001-boot-platformsh`,
          `${options.platformsh.appMountDir}:/app:delegated`,
        ],
        working_dir: '/app',
      })});

      // Pass down
      super(id, options, ...sources);
    };
  },
};
