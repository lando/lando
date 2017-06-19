/**
 * Drupal7 recipe builder
 *
 * @name drupal7
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var helpers = require('./../lamp/lamp')(lando);

  /**
   * Helper to get DRUSH URL
   */
  var drushUrl = function(drush) {

    // Base URL
    var ghRelease = 'https://github.com/drush-ops/drush/releases/download/';

    // Start with version
    var download = ghRelease + drush + '/drush.phar';

    // Overrule to stable if needed
    if (drush === 'stable') {
      download = 'http://files.drush.org/drush.phar';
    }
    // return URL
    return download;

  };

  /**
   * Build out Drupal7
   */
  var build = function(name, config) {

    // Get the via so we can grab our builder
    var base = (_.get(config, 'via', 'apache') === 'apache') ? 'lamp' : 'lemp';

    // Update with new config defaults if needed
    config = helpers.resetConfig(config._recipe, config);

    // Set the default php version for D7
    config.php = _.get(config, 'php', '7.0');

    // Start by cheating
    var build = lando.recipes.build(name, base, config);

    // Get the specified version of Drush
    var drush = _.get(config, 'drush', 'stable');

    // Volume mount the drush cache
    var volumesKey = 'services.appserver.volumes';
    build.services.appserver.volumes = _.get(build, volumesKey, []);
    build.services.appserver.volumes.push('/var/www/.drush');

    // Build what we need to get the drush install command
    var pharUrl = drushUrl(drush);
    var src = 'drush.phar';
    var dest = '/usr/local/bin/drush';
    var drushStatusCheck = ['./' + src, 'core-status'];

    // Get the drush commands
    var pharInstall = helpers.getPhar(pharUrl, src, dest, drushStatusCheck);
    var cgrInstall = helpers.getCgr('drush/drush', drush);

    // Set builders if needed
    var buildersKey = 'services.appserver.build';
    build.services.appserver.build = _.get(build, buildersKey, []);

    // Add our drush cmds
    var drushCmd = [pharInstall, cgrInstall].join(' || ');
    build.services.appserver.build.push(drushCmd);

    // Add drush to the tooling
    build.tooling.drush = {
      service: 'appserver',
      description: 'Run drush commands'
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
