'use strict';

module.exports = function(lando) {

  // Modules
  const _ = lando.node._;
  const helpers = require('./../lamp/lamp')(lando);

  /*
   * Helper to get cache
   */
  const cache = cache => {

    // Return redis
    if (_.includes(cache, 'redis')) {
      return {
        type: cache,
        portforward: true,
        persist: true
      };
    }

    // Or memcached
    else if (_.includes(cache, 'memcached')) {
      return {
        type: cache,
        portforward: true
      };
    }

  };

  /*
   * Build out laravel
   */
  const build = (name, config) => {

    // Get the via so we can grab our builder
    const base = (_.get(config, 'via', 'apache') === 'apache') ? 'lamp' : 'lemp';

    // Update with new config defaults if needed
    config = helpers.resetConfig(config._recipe, config);

    // Set the default php version for laravel
    config.php = _.get(config, 'php', '7.1');

    // Start by cheating
    const build = lando.recipes.build(name, base, config);

    // Set the environment
    const envPath = 'services.appserver.overrides.services.environment';
    _.set(build, envPath, {APP_LOG: 'errorlog'});

    // Figure out some tooling needs
    const needs = ['database'];

    // Add in cache func if needed
    if (_.has(config, 'cache')) {

      // Add the cache service
      build.services.cache = cache(config.cache);

      // Add it as something our tooling needs
      needs.push('cache');

    }

    // Add in installation of laravel tool
    const cgrInstall = helpers.getCgr('laravel/installer', '*');

    // Set builders if needed
    const buildersKey = 'services.appserver.run_internal';
    build.services.appserver.run_internal = _.get(build, buildersKey, []);

    // Add our cgr cmds
    build.services.appserver.run_internal.push(cgrInstall);

    // Add artisan command
    build.tooling.artisan = {
      service: 'appserver',
      needs: needs,
      cmd: ['php', 'artisan']
    };

    // Add laravel command
    build.tooling.laravel = {
      needs: needs,
      service: 'appserver'
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
