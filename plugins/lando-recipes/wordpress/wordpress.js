/**
 * WordPress recipe builder
 *
 * @name wordpress
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var path = require('path');

  /**
   * Build out WordPress
   */
  var build = function(name, config) {

    // Determine some things
    var base = (_.get(config, 'via', 'apache') === 'apache') ? 'lamp' : 'lemp';
    var database = _.get(config, 'database', 'mysql');
    var configPath = path.join(lando.config.engineConfigDir, 'wordpress');

    // Use our default wordpress config files if they have not been specified by the user
    if (_.isEmpty(config.conf)) {
      config.conf = {};
    }
    if (!_.has(config, 'conf.server') && base === 'lemp') {
      var nginxConf = path.join(configPath, 'wordpress.conf');
      config.conf.server = nginxConf;
    }
    if (!_.has(config, 'conf.php')) {
      var phpConf = path.join(configPath, 'php.ini');
      config.conf.php = phpConf;
    }
    // @TODO: add a custom/optimzed default postgres cong file
    if (!_.has(config, 'conf.database') && !_.includes(database, 'postgres')) {
      var dbConf = path.join(configPath, 'mysql');
      config.conf.database = dbConf;
    }

    // Set the default php version for wordpress
    config.php = _.get(config, 'php', '7.1');

    // Start by cheating
    var stack = require('./../' + [base, base].join('/'))(lando);
    var build = stack.build(name, config);

    // Override the database credentials
    build.services.database.creds = {
      user: 'wordpress',
      password: 'wordpress',
      database: 'wordpress'
    };

    // Add WP db credentials into the ENV
    build.services.appserver.overrides = {
      services: {
        environment: {
          DB_HOST: 'database',
          DB_USER: build.services.database.creds.user,
          DB_PASSWORD: build.services.database.creds.password,
          DB_NAME: build.services.database.creds.database,
          DB_PORT: 3306
        }
      }
    };

    // Add WPCLI
    build.services.appserver.composer = {
      'wp-cli/wp-cli': '*'
    };
    build.tooling.wp = {
      service: 'appserver',
      description: 'Run wp-cli commands'
    };

    // Return the things
    return build;

  };

  // Return the things
  return {
    build: build,
    configDir: __dirname
  };

};
