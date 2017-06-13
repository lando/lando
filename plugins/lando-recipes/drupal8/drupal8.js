/**
 * Drupal 8 recipe builder
 *
 * @name drupal8
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /**
   * Build out Drupal8
   */
  var build = function(name, config) {

    // Set the default php version for Drupal 8
    config.php = _.get(config, 'php', '7.1');

    // Start by cheating
    var stack = require('./../drupal7/drupal7')(lando);
    var build = stack.build(name, config);

    // Add drupal console install command if needed
    if (_.has(config, 'drupal')) {

      // Get the install cmd
      var pharUrl = 'https://drupalconsole.com/installer';
      var src = 'drupal.phar';
      var dest = '/usr/local/bin/drupal';
      var drupalInstall = stack.getPhar(pharUrl, src, dest);

      // Set builders if needed
      var key = 'services.appserver.build';
      build.services.appserver.build = _.get(build, key, []);

      // Add our drupal cmds
      build.services.appserver.build.push(drupalInstall);

      // Set tooling
      // Add drupal to the tooling
      build.tooling.drupal = {
        service: 'appserver',
        description: 'Run drupal commands',
      };

    }

    // Return the things
    return build;

  };

  // Return the things
  return {
    build: build,
    configDir: __dirname
  };

};
