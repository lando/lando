'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const path = require('path');

  // Registry of recipes
  const registry = {
    custom: {
      build: () => ({}),
    },
  };

  /*
   * Get a recipe
   *
   * @since 3.0.0
   * @alias 'lando.recipes.get'
   */
  const get = name => {
    if (name) {
      return registry[name];
    }
    return _.keys(registry);
  };

  /*
   * Add a recipe to the registry
   *
   * @since 3.0.0
   * @alias 'lando.recipes.add'
   */
  const add = (name, recipe) => {
    registry[name] = recipe;
  };

  /*
   * The core recipe builder
   *
   * @since 3.0.0
   * @alias 'lando.recipes.build'
   */
  const build = (name, recipe, config) => {
    // Check to verify whether the recipe exists in the registry
    if (!registry[recipe]) {
      lando.log.warn('%s is not a supported recipe.', recipe);
      return {};
    }

    // Log
    lando.log.verbose('Building %s for %s', recipe, name);
    lando.log.debug('Building %s with config', name, config);

    // Piggyback off of moveConfig
    // Move our config into the userconfroot if we have some
    // NOTE: we need to do this because on macOS and Windows not all host files
    // are shared into the docker vm
    if (_.has(registry[recipe], 'configDir')) {
      const to = path.join(lando.config.servicesConfigDir, recipe);
      lando.utils.engine.moveConfig(registry[recipe].configDir, to);
    }

    // Return the built config file
    return registry[recipe].build(name, config);
  };

  /*
   * Helper to let us know whether this app requires a webroot question or not
   *
   * @since 3.0.0
   * @alias 'lando.recipes.webroot'
   */
  const webroot = recipe => {
    // Check to verify whether the recipe exists in the registry
    if (!registry[recipe]) {
      lando.log.warn('%s is not a supported recipe.', recipe);
      return {};
    }

    // Return things
    return _.get(registry[recipe], 'webroot', true);
  };

  /*
   * Helper to let us know whether this app requires a name question or not
   *
   * @since 3.0.0
   * @alias 'lando.recipes.name'
   */
  const name = recipe => {
    // Check to verify whether the recipe exists in the registry
    if (!registry[recipe]) {
      lando.log.warn('%s is not a supported recipe.', recipe);
      return {};
    }

    // Return things
    return _.get(registry[recipe], 'name', true);
  };

  return {
    add: add,
    build: build,
    get: get,
    name: name,
    webroot: webroot,
  };
};
