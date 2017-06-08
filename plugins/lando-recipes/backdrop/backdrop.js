/**
 * Backdrop recipe builder
 *
 * @name backdrop
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var path = require('path');

  /**
   * Build out Backdrop
   */
  var build = function(name, config) {

    // Determine some things
    var base = (_.get(config, 'via', 'apache') === 'apache') ? 'lamp' : 'lemp';
    var database = _.get(config, 'database', 'mysql');
    var configPath = path.join(lando.config.engineConfigDir, 'backdrop');

    // Use our default drupal config files if they have not been specified by the user
    if (_.isEmpty(config.conf)) {
      config.conf = {};
    }
    if (!_.has(config, 'conf.server') && base === 'lemp') {
      var nginxConf = path.join(configPath, 'backdrop.conf');
      config.conf.server = nginxConf;
    }
    if (!_.has(config, 'conf.php')) {
      var phpConf = path.join(configPath, 'php.ini');
      config.conf.php = phpConf;
    }
    if (!_.has(config, 'conf.database') && !_.includes(database, 'postgres')) {
      var dbConf = path.join(configPath, 'mysql');
      config.conf.database = dbConf;
    }

    // Set the default php version for D6
    config.php = _.get(config, 'php', '7.0');

    // Start by cheating
    var stack = require('./../drupal7/drupal7')(lando);
    var build = stack.build(name, config);

    // Override the database credentials
    build.services.database.creds = {
      user: 'backdrop',
      password: 'backdrop',
      database: 'backdrop'
    };

    // Set BACKDROP_SETTINGS
    var backdropSettings = JSON.stringify({
      databases: {
        default: {
          default: {
            driver: 'mysql',
            database: 'backdrop',
            username: 'backdrop',
            password: 'backdrop',
            host: 'database',
            port: 3306
          }
        }
      }
    });
    build.services.appserver.overrides = {
      services: {
        environment: {
          BACKDROP_SETTINGS: backdropSettings,
          DB_HOST: 'database',
          DB_USER: build.services.database.creds.user,
          DB_PASSWORD: build.services.database.creds.password,
          DB_NAME: build.services.database.creds.database,
          DB_PORT: 3306
        }
      }
    };

    // Configure the backdrush things
    delete build.tooling.drush;
    build.tooling.backdrush = {
      service: 'appserver',
      description: 'Run backdrush commands',
      cmd: ['drush']
    };

    // Define our versions
    var backdrush = _.get(config, 'backdrush', 'stable');
    var baseUrl = 'https://github.com/backdrop-contrib/drush/archive/';
    var backdrushVersions = {
      stable: baseUrl + '0.0.4.tar.gz',
      dev: baseUrl + '1.x-0.x.tar.gz'
    };
    var burl = backdrushVersions[backdrush];
    var tar = 'tar -xz --strip-components=1';
    var commands = '/usr/share/drush/commands/backdrop';

    // Add some extras so we can download our backdrop drush extension
    var extras = [
      'mkdir -p ' + commands,
      'curl -fsSL ' + burl + ' | ' + tar + ' -C ' + commands,
      'drush cc drush'
    ];
    build.services.appserver.extras = extras;

    // Return the things
    return build;

  };

  // Return the things
  return {
    build: build,
    configDir: __dirname
  };

};
