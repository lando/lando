/**
 * This provides a way to load services
 *
 * @name services
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var path = require('path');

  // Registry of services
  var registry = {};

  /*
   * Get all services
   */
  var get = function() {
    return _.keys(registry);
  };

  /*
   * Add a service to the registry
   */
  var add = function(name, module) {
    registry[name] = module;
  };

  /**
   * Helper to ensure config files exist and are good
   */
  var setConfig = function(local, remote) {

    // Normalize the path
    var isAbs = path.isAbsolute(local);
    local = (isAbs) ? local : path.join('$LANDO_APP_ROOT_BIND', local);

    // Return volume mount
    return [local, remote].join(':');

  };

  /**
   * The core service builder
   */
  var build = function(name, type, config) {

    // Parse the type
    var service = type.split(':')[0];

    // Add a version from the tag if available
    config.version = type.split(':')[1] || 'latest';

    // Return the built service
    return registry[service].builder(name, config);

  };

  return {
    add: add,
    setConfig: setConfig,
    build: build,
    get: get
  };

};
