/**
 * This provides a way to load new init methods
 *
 * @name init
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Registry of init methods
  var registry = {};

  /*
   * Get an init method
   */
  var get = function(name) {
    if (name) {
      return registry[name];
    }
    return _.keys(registry);
  };

  /*
   * Add an init method to the registry
   */
  var add = function(name, module) {
    registry[name] = module;
  };

  /**
   * The core init method
   */
  var build = function(name, method, config) {

    // Check to verify whether the recipe exists in the registry
    if (!registry[method]) {
      lando.log.warn('%s is not a supported init method.', method);
      return {};
    }

    // Log
    lando.log.verbose('Building %s for %s', method, name);
    lando.log.debug('Building %s with config', name, config);

    // Return the init function
    return registry[method].build(name, config);

  };

  /*
   * Helper to spit out a .lando.yml file
   */
  var yaml = function(recipe, config, options) {

    // Check to verify whether the recipe exists in the registry
    if (!registry[recipe]) {
      return config;
    }

    // Log
    lando.log.verbose('Getting more config for %s app %s', recipe, config.name);
    lando.log.debug('Getting more for %s using %j', config.name, options);

    // Return the .lando.yml
    return registry[recipe].yaml(config, options);

  };

  return {
    add: add,
    build: build,
    get: get,
    yaml: yaml
  };

};
