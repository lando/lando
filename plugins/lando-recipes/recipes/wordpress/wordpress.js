'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var helpers = require('./../lamp/lamp')(lando);

  /*
   * Helper to get WPCLI URL
   */
  var wpCliUrl = function() {

    // baseURL
    var baseUrl = 'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/';

    // return URL
    return baseUrl + 'phar/wp-cli.phar';

  };

  /*
   * Build out WordPress
   */
  var build = function(name, config) {

    // Get the via so we can grab our builder
    var base = (_.get(config, 'via', 'apache') === 'apache') ? 'lamp' : 'lemp';

    // Update with new config defaults if needed
    config = helpers.resetConfig(config._recipe, config);

    // Set the default php version for WordPress
    config.php = _.get(config, 'php', '7.1');

    // Start by cheating
    var build = lando.recipes.build(name, base, config);

    // Add wp-cli to volumes
    var volumesKey = 'services.appserver.overrides.services.volumes';
    var vols = _.get(build, volumesKey, []);
    vols.push('/var/www/.wp-cli');
    _.set(build, volumesKey, vols);

    // Build what we need to get the wp-cli install command
    var pharUrl = wpCliUrl();
    var src = 'wp-cli.phar';
    var dest = '/usr/local/bin/wp';
    var wpStatusCheck = ['php', src, '--allow-root', '--info'];

    // Get the wp install command
    var wpInstall = helpers.getPhar(pharUrl, src, dest, wpStatusCheck);

    // Set builders if needed
    var key = 'services.appserver.run_internal';
    build.services.appserver.run_internal = _.get(build, key, []);

    // Add our isntall cmds
    build.services.appserver.run_internal.push(wpInstall);

    // Add wp command
    build.tooling.wp = {
      service: 'appserver',
      description: 'Run wp-cli commands',
      cmd: ['wp', '--allow-root']
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
