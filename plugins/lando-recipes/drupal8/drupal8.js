/**
 * Drupal 8 recipe builder
 *
 * @name drupal8
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var path = require('path');
  var helpers = require('./../lamp/lamp')(lando);

  /**
   * Build out Drupal8
   */
  var build = function(name, config) {

    // Set the default php version for Drupal 8
    config.php = _.get(config, 'php', '7.1');

    // Start by cheating
    var build = lando.recipes.build(name, 'drupal7', config);

    // Add drupal console install command if needed
    if (_.has(config, 'drupal')) {

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

    // Determine the service to run cli things on
    var cliService = 'appserver';

    // Run composer install if we have the file
    if (fs.existsSync((path.join(config._root, 'composer.json')))) {
      var composerInstall = 'cd $LANDO_MOUNT ';
      composerInstall += '&& composer require drupal/console:~1.0 ';
      composerInstall += '--prefer-dist --optimize-autoloader';
      composerInstall += '&& composer install';

      build.services[cliService].build.push(composerInstall);
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
