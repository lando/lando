/**
 * Drupal6 recipe builder
 *
 * @name drupal6
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var path = require('path');

  /**
   * Build out Drupal6
   */
  var build = function(name, config) {

    // Determine some things
    var base = (_.get(config, 'via', 'apache') === 'apache') ? 'lamp' : 'lemp';
    var database = _.get(config, 'database', 'mysql');
    var configPath = path.join(lando.config.engineConfigDir, 'drupal6');

    // Use our default drupal config files if they have not been specified by the user
    if (_.isEmpty(config.conf)) {
      config.conf = {};
    }
    if (!_.has(config, 'conf.server') && base === 'lemp') {
      var nginxConf = path.join(configPath, 'drupal6.conf');
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

    // Set the default php version for D6
    config.php = _.get(config, 'php', '5.6');

    // Start by cheating
    var stack = require('./../drupal7/drupal7')(lando);
    var build = stack.build(name, config);

    // Return the things
    return build;

  };

  // Return the things
  return {
    build: build,
    configDir: __dirname
  };

};
