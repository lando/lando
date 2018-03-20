'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var helpers = require('./../lamp/lamp')(lando);

  // "Constants"
  var DRUSH8 = '8.1.16';
  var DRUSH7 = '7.4.0';
  var DRUSHLAUNCHER = '0.6.0';

  /*
   * Helper to get DRUSH 8 or DRUSH LAUNCHER phar
   */
  var drushUrl = function(thing, version) {

    // Base URL
    var base = 'https://github.com/drush-ops/' + thing + '/releases/download/';

    // Start with version
    return base + version + '/drush.phar';

  };

  /*
   * Helper to get the phar build command
   */
  var pharOut = function(url, status) {
    return helpers.getPhar(url, 'drush.phar', '/usr/local/bin/drush', status);
  };

  /*
   * Helper to figure out how to handle drush
   */
  var drush = function(build, config) {

    // If config is false we are done
    if (!config) {
      return build;
    }

    // Otherwise get the config type
    var type = config.split(':')[0];
    var value = config.split(':')[1] || type;

    // Backwards compatibility for older drush config
    // This assumes versions set in the old format will be installed globally
    if (!_.includes(['composer', 'global', 'path'], type)) {
      value = (type === 'stable') ? DRUSH8 : type;
      type = 'global';
    }

    // Add drush to the tooling
    build.tooling.drush = {
      service: 'appserver',
      needs: ['database'],
      description: 'Run drush commands'
    };

    // Add a different path to the drush binary if specified
    if (type === 'path' && !_.isEmpty(value)) {
      build.tooling.drush.cmd = value;
    }

    // Or run the correct install command
    else if (type === 'composer' || (type === 'global' && !_.isEmpty(value))) {

      // Assume a global composer install to start
      var cmd = helpers.getCgr('drush/drush', value);

      // If composer or drush 8
      if (type === 'composer' || (value && value.split('.')[0] === '8')) {
        var isComposer = (type === 'composer');
        var repo = isComposer ? 'drush-launcher' : 'drush';
        var version = isComposer ? DRUSHLAUNCHER : value;
        var status = isComposer ? '--drush-launcher-version' : 'core-status';
        var url = drushUrl(repo, version);
        cmd = pharOut(url, ['./drush.phar', status]);
      }

      // Set the command
      build.services.appserver.run_internal.push(cmd);

    }

    // Volume mount the drush cache
    var volumesKey = 'services.appserver.overrides.services.volumes';
    var vols = _.get(build, volumesKey, []);
    vols.push('/var/www/.drush');
    _.set(build, volumesKey, vols);

    // Return
    return build;

  };

  /*
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

    // Determine the default drush setup for D7
    var defaultDrush = (config.php === '5.3' ? DRUSH7 : DRUSH8);

    // Get the drush config
    var drushConfig = _.get(config, 'drush', 'global:' + defaultDrush);

    // Handle drush
    var buildersKey = 'services.appserver.run_internal';
    build.services.appserver.run_internal = _.get(build, buildersKey, []);
    build = drush(build, drushConfig);

    // Return the things
    return build;

  };

  // Return the things
  return {
    build: build,
    configDir: __dirname
  };

};
