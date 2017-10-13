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
  var fs = lando.node.fs;
  var path = require('path');

  /**
   * Build out Drupal8
   */
  var build = function(name, config) {

    // Set the default php version for Drupal 8
    config.php = _.get(config, 'php', '7.1');

    // Start by cheating
    var build = lando.recipes.build(name, 'drupal7', config);

    // Add Drupal Console
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

    // Determine the service to run cli things on
    var cliService = 'appserver';

    // Run composer install if we have the file
    if (fs.existsSync((path.join(config._root, 'composer.json')))) {
      var composerInstall = 'cd $LANDO_MOUNT && composer install';

      // Check if Drupal Console is already required by the project.
      var composerFile = require(path.join(config._root, 'composer.json'));
      if (!composerFile.require['drupal/console']) {
        var installDC = 'cd $LANDO_MOUNT &&';
        installDC += 'composer require drupal/console:~1.0 ';
        installDC += '--prefer-dist --optimize-autoloader';
        build.services[cliService].build.push(installDC);
      }

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
