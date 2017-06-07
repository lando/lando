/**
 * Drupal7 recipe builder
 *
 * @name drupal7
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var path = require('path');

  /**
   * Build out Drupal7
   */
  var build = function(name, config) {

    // Determine some things
    var base = (_.get(config, 'via', 'apache') === 'apache') ? 'lamp' : 'lemp';
    var database = _.get(config, 'database', 'mysql');
    var drush = _.get(config, 'drush', '8');

    // Start by cheating
    var stack = require('./../' + [base, base].join('/'))(lando);
    var build = stack.build(name, config);

    // Override the database credentials
    build.services.database.creds = {
      user: 'drupal',
      password: 'drupal',
      database: 'drupal'
    };

    // Determine the path to our config
    var configPath = path.join(lando.config.engineConfigDir, 'drupal7');

    // Determine if db type is MYSQL
    // @TODO: add a custom/optimzed default postgres cong file
    var isMySQL = !_.includes(database, 'postgres');

    // Use our default drupal config files if they have not been specified by the user
    if (!_.has(config, 'conf.server') && base === 'lemp') {
      var nginxConf = path.join(configPath, 'drupal7.conf');
      build.services.appserver.config.server = nginxConf;
    }
    if (!_.has(config, 'conf.php')) {
      var phpConf = path.join(configPath, 'php.ini');
      build.services.appserver.config.conf = phpConf;
    }
    if (!_.has(config, 'conf.database') && isMySQL) {
      var dbConf = path.join(configPath, 'mysql');
      build.services.database.config.confd = dbConf;
    }

    // Add in the drush things
    build.services.appserver.composer = {
      'drush/drush': '~' + drush
    };
    build.tooling.drush = {
      service: 'appserver',
      description: 'Run Drush commands',
      user: 'www-data'
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
