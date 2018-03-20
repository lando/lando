'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var helpers = require('./../lamp/lamp')(lando);

  /*
   * Build out joomla
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

    // Get the joomla tools command
    var cgrInstall = helpers.getCgr('joomlatools/console', '*');

    // Set builders if needed
    var buildersKey = 'services.appserver.run_internal';
    build.services.appserver.run_internal = _.get(build, buildersKey, []);

    // Add our drush cmds
    build.services.appserver.run_internal.push(cgrInstall);

    // Add drush to the tooling
    build.tooling.joomla = {
      service: 'appserver',
      needs: ['database']
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
