'use strict';

// Modules
var _ = require('lodash');
var fs = require('fs-extra');
var Log = require('./logger');
var path = require('path');
var Promise = require('./promise');
// eslint-disable-next-line
var webpack = typeof __webpack_require__ === 'function'

// eslint-disable-next-line
var dynamicRequire = (webpack) ? __non_webpack_require__ : require;

// We make this module into a function so we can pass in a logger
module.exports = function(logger) {

  // Set up the logger
  var log = logger || new Log();

  /*
   * Helper function to find plugin location
   */
  var findPlugin = function(plugin, dirs) {

    // If dirs is not an array lets make it into one
    if (typeof dirs === 'string') {
      dirs = [dirs];
    }

    // Each dir could have any of these sub dirs.
    var subDirs = [
      'node_modules',
      'plugins'
    ];

    // Helper function that lodash should be ashamed for not having. :P
    var flattenMap = function(elts, iterator) {
      return _(elts).chain().map(iterator).flatten().value();
    };

    // Map dirs to full list of paths.
    var searchPaths = flattenMap(dirs, function(dir) {
      return _.map(subDirs, function(subDir) {
        return path.join(dir, subDir, plugin, 'index.js');
      });
    });

    // Log the search location
    log.debug('Searching for %s plugin in %j', plugin, searchPaths);

    // Filter paths by existance.
    return Promise.filter(searchPaths, fs.pathExistsSync).all()

    // Grabs the last path so that we load things from SRC -> SYS -> USER -> OTHER
    .then(function(plugins) {

      // Get the correct path
      var pluginPath = _.last(plugins);

      // If we have a path lets cache it and return it
      if (pluginPath) {
        return pluginPath;
      }

    });

  };

  /**
   * Loads a plugin.
   *
   * For each directory scanned plugins can live in either the `plugins` or
   * `node_modules` subdirectories
   *
   * @since 3.0.0
   * @alias 'lando.plugins.load'
   * @param {String} plugin - The name of the plugin
   * @param {Array} dirs - The directories to scan for plugins.
   * @param {Object} [inject] - An object to inject into the plugin.
   * @returns {Promise} A Promise.
   * @example
   *
   * // Load the plugin called 'shield-generator' and additionally scan `/tmp` for the plugin
   * return lando.plugins.load('shield-generator', ['/tmp']);
   *
   */
  var load = function(plugin, dirs, injected) {

    // Find our module path
    return findPlugin(plugin, dirs)

    // Load the plugin if we have a path
    .then(function(pluginPath) {

      // If we couldn't find a plugin then warn the user
      if (!pluginPath) {
        log.warn('Could not find plugin %s', plugin);
      }

      // Try to load the plugin
      else {

        // Kick off the chain and try to require
        return Promise.try(function() {
          return dynamicRequire(pluginPath)(injected);
        })

        // If success report that and cache the path
        .then(function() {
          log.verbose('Plugin %s loaded from %s', plugin, pluginPath);
        })

        // Catch any load failurs
        .catch(function(err) {
          throw new Error(err);
        });

      }

    });

  };

  // Return the plugin object
  return {
    load: load
  };

};
