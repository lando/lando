/**
 * Drupal7 recipe builder
 *
 * @name drupal7
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var lamp = require('./../lamp/lamp')(lando);
  var lemp = require('./../lemp/lemp')(lando);
  var stacks = {lamp: lamp, lemp: lemp};

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
    var stack = stacks[base];

    // Update with new config defaults if needed
    config = stack.resetConfig(config.recipe, config);

    // Set the default php version for D7
    config.php = _.get(config, 'php', '7.0');

    // Start by cheating
    var build = stack.build(name, config);

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
    var pharInstall = stack.getPhar(pharUrl, src, dest, drushStatusCheck);
    var cgrInstall = stack.getCgr('drush/drush', drush);

    // Set extras if needed
    var extrasKey = 'services.appserver.extras';
    build.services.appserver.extras = _.get(build, extrasKey, []);

    // Add our drush cmds
    var drushCmd = [pharInstall, cgrInstall].join(' || ');
    build.services.appserver.extras.push(drushCmd);

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
    configDir: __dirname,
    getCgr: lamp.getCgr,
    getPhar: lamp.getPhar
  };

};
