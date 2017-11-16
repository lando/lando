/**
 * Drupal 8 recipe builder
 *
 * @name drupal8
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var helpers = require('./../lamp/lamp')(lando);

  /**
   * Build out Drupal8
   */
  var build = function(name, config) {

    // Set the default php version for Drupal 8
    config.php = _.get(config, 'php', '7.1');

    // Start by cheating
    var build = lando.recipes.build(name, 'drupal7', config);
    var drupalConsole = _.get(config, 'drupal', true);

    // Add drupal console install command if needed
    if (drupalConsole === true) {

      // Get the install cmd
      var pharUrl = 'https://drupalconsole.com/installer';
      var src = 'drupal.phar';
      var dest = '/usr/local/bin/drupal';
      var drupalInstall = helpers.getPhar(pharUrl, src, dest);

      // Set builders if needed
      var key = 'services.appserver.build';
      build.services.appserver.build = _.get(build, key, []);

      // Add our drupal cmds
      build.services.appserver.build.push(drupalInstall);

      // Set tooling
      // Add drupal to the tooling
      build.tooling.drupal = {
        service: 'appserver',
        needs: ['database'],
        description: 'Run drupal console commands',
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
