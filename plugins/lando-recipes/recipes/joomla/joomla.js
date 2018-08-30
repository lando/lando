'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const helpers = require('./../lamp/lamp')(lando);

  /*
   * Build out joomla
   */
  const build = (name, config) => {
    // Get the via so we can grab our builder
    const base = (_.get(config, 'via', 'apache') === 'apache') ? 'lamp' : 'lemp';

    // Update with new config defaults if needed
    config = helpers.resetConfig(config._recipe, config);

    // Set the default php version for D7
    config.php = _.get(config, 'php', '7.0');

    // Start by cheating
    const build = lando.recipes.build(name, base, config);

    // Get the joomla tools command
    const cgrInstall = helpers.getCgr('joomlatools/console', '*');

    // Set builders if needed
    const buildersKey = 'services.appserver.run_internal';
    build.services.appserver.run_internal = _.get(build, buildersKey, []);

    // Add our drush cmds
    build.services.appserver.run_internal.push(cgrInstall);

    // Add drush to the tooling
    build.tooling.joomla = {
      service: 'appserver',
      needs: ['database'],
    };

    // Return the things
    return build;
  };

  // Return the things
  return {
    build: build,
    configDir: __dirname,
  };
};
