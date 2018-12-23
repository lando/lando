'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const helpers = require('./../lamp/lamp')(lando);

  /*
   * Helper to get WPCLI URL
   */
  const wpCliUrl = () => {
    // baseURL
    const baseUrl = 'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/';
    // return URL
    return baseUrl + 'phar/wp-cli.phar';
  };

  /*
   * Build out WordPress
   */
  const build = (name, config) => {
    // Get the via so we can grab our builder
    const base = (_.get(config, 'via', 'apache') === 'apache') ? 'lamp' : 'lemp';

    // Update with new config defaults if needed
    config = helpers.resetConfig(config._recipe, config);

    // Set the default php version for WordPress
    config.php = _.get(config, 'php', '7.1');

    // Start by cheating
    const build = lando.recipes.build(name, base, config);

    // Add wp-cli to volumes
    const volumesKey = 'services.appserver.overrides.services.volumes';
    const vols = _.get(build, volumesKey, []);
    vols.push('/var/www/.wp-cli');
    _.set(build, volumesKey, vols);

    // Build what we need to get the wp-cli install command
    const pharUrl = wpCliUrl();
    const src = 'wp-cli.phar';
    const dest = '/usr/local/bin/wp';
    const wpStatusCheck = ['php', src, '--allow-root', '--info'];

    // Get the wp install command
    const wpInstall = helpers.getPhar(pharUrl, src, dest, wpStatusCheck);

    // Set builders if needed
    const key = 'services.appserver.install_dependencies_as_me_internal';
    build.services.appserver.install_dependencies_as_me_internal = _.get(build, key, []);

    // Add our isntall cmds
    build.services.appserver.install_dependencies_as_me_internal.push(wpInstall);

    // Add wp command
    build.tooling.wp = {
      service: 'appserver',
      description: 'Run wp-cli commands',
      cmd: 'wp --allow-root',
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
