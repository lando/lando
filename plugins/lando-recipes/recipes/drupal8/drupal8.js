'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const helpers = require('./../lamp/lamp')(lando);

  /*
   * Build out Drupal8
   */
  const build = (name, config) => {
    // Set Drupal 8 defaults
    config.php = _.get(config, 'php', '7.1');
    config.drush = _.get(config, 'drush', 'composer');

    // Start by cheating
    const build = lando.recipes.build(name, 'drupal7', config);
    const drupalConsole = _.get(config, 'drupal', true);

    // Add drupal console install command if needed
    if (drupalConsole === true) {
      // Get the install cmd
      const pharUrl = 'https://drupalconsole.com/installer';
      const src = 'drupal.phar';
      const dest = '/usr/local/bin/drupal';
      const drupalInstall = helpers.getPhar(pharUrl, src, dest);

      // Set builders and volumes if needed
      const builderKey = 'services.appserver.run_internal';
      build.services.appserver.run_internal = _.get(build, builderKey, []);

      // Add our drupal cmds and volumes
      build.services.appserver.run_internal.push(drupalInstall);

      // Volume mount the drupal console cache
      const volumesKey = 'services.appserver.overrides.services.volumes';
      const vols = _.get(build, volumesKey, []);
      vols.push('/const/www/.drupal');
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
    configDir: __dirname,
  };
};
