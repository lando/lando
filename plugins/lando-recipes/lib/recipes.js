/**
 * This provides a way to load recipes
 *
 * @name recipes
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Registry of recipes
  var registry = {};

  /*
   * Get all recipes
   */
  var get = function() {
    return _.keys(registry);
  };

  /*
   * Add a recipe to the registry
   */
  var add = function(name, module) {
    registry[name] = module;
  };

  /**
   * The core recipe builder
   */
  var build = function(name, recipe, config) {

    // Check to verify whether the recipe exists in the registry
    if (!registry[recipe]) {
      lando.log.warn('%s is not a supported recipe.', recipe);
      return {};
    }

    // Log
    lando.log.verbose('Building %s for %s', recipe, name);
    lando.log.debug('Building %s with config', name, config);

    // Return the built config file
    return registry[recipe](name, config);

  };

  return {
    add: add,
    build: build,
    get: get,
  };

};
