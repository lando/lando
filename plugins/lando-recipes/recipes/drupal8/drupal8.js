'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var helpers = require('./../lamp/lamp')(lando);

  /*
   * Build out Drupal8
   */
  var build = function(name, config) {

    // Set Drupal 8 defaults
    config.php = _.get(config, 'php', '7.1');
    config.drush = _.get(config, 'drush', 'composer');

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

      // Set builders and volumes if needed
      var builderKey = 'services.appserver.run_internal';
      build.services.appserver.run_internal = _.get(build, builderKey, []);

      // Add our drupal cmds and volumes
      build.services.appserver.run_internal.push(drupalInstall);

      // Volume mount the drupal console cache
      var volumesKey = 'services.appserver.overrides.services.volumes';
      var vols = _.get(build, volumesKey, []);
      vols.push('/var/www/.drupal');
      _.set(build, volumesKey, vols);

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
