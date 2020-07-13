'use strict';

// Modules
const _ = require('lodash');
const utils = require('./lib/utils');

/*
 * @TODO
 */
module.exports = (app, lando) => {
  // Tooling cache key
  const toolingCache = `${app.name}.tooling.cache`;

  // Load in our recipe stuff
  app.events.on('pre-init', 4, () => {
    if (_.has(app, 'config.recipe')) {
      // Throw a warning if recipe is not supported
      if (_.isEmpty(_.find(lando.factory.get(), {name: app.config.recipe}))) {
        app.log.warn('%s is not a supported recipe type.', app.config.recipe);
      }
      // Log da things
      app.log.verbose('building %s recipe named', app.config.recipe);
      // Build da things
      // @NOTE: this also gathers app.info and build steps
      const Recipe = lando.factory.get(app.config.recipe);
      const config = utils.parseConfig(app.config.recipe, app);
      // Get recipe config
      const recipe = new Recipe(config.name, config).config;
      // Cache dump our app tooling so we can use it in our entrypoint
      // @NOTE: we dump pre-merge so that tooling directly in the landofile is not mixed in
      lando.cache.set(toolingCache, JSON.stringify(recipe.tooling), {persist: true});
      // Merge stuff together correctly
      app.config.proxy = _.merge({}, recipe.proxy, _.get(app, 'config.proxy', {}));
      app.config = lando.utils.merge({services: recipe.services, tooling: recipe.tooling}, app.config);
    }
  });

  // Remove tooling cache on uninstall
  app.events.on('post-uninstall', () => {
    app.log.verbose('removing tooling cache...');
    lando.cache.remove(toolingCache);
  });
};
