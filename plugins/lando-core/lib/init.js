/**
 * This provides a way to load new init methods
 *
 * @name init
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var path = require('path');
  var yaml = lando.node.yaml;

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
  var yamlme = function(options) {

    // Build the .lando.yml file
    var config = {
      name: options.appname,
      recipe: options.recipe,
      config: {
        webroot: options.webroot
      }
    };

    // Name the file
    var dest = path.join(options.destination, '.lando.yml');

    // Construct the yamlfile
    fs.writeFileSync(dest, yaml.safeDump(config));

  };

  return {
    add: add,
    build: build,
    get: get,
    yamlme: yamlme
  };

};
