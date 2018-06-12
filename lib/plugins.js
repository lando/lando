'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const Log = require('./logger');
const path = require('path');
const Promise = require('./promise');

// Helper for dynamic requires
// eslint-disable-next-line
const dynamicRequire = () => (typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require);

module.exports = class Plugins {
  constructor(log = new Log()) {
    this.loadedModules = [];
    this.log = log;
  }

  /*
   * Helper function to find plugin location
   */
  findPlugin(plugin, dirs) {
    // If dirs is not an array lets make it into one
    if (typeof dirs === 'string') dirs = [dirs];
    // Each dir could have any of these sub dirs.
    const subDirs = ['node_modules', 'plugins'];
    // Helper function that lodash should be ashamed for not having. :P
    const flattenMap = (elts, iterator) => _(elts).chain().map(iterator).flatten().value();
    // Map dirs to full list of paths.
    const searchPaths = flattenMap(dirs, dir => _.map(subDirs, subDir => path.join(dir, subDir, plugin, 'index.js')));
    // Log the search location
    this.log.debug('Searching for %s plugin in %j', plugin, searchPaths);
    // Filter paths by existance.
    return Promise.filter(searchPaths, fs.existsSync).all()
    // Grabs the last path so that we load things from SRC -> SYS -> USER -> OTHER
    .then(plugins => _.last(plugins));
  };

  /**
   * Loads a plugin.
   *
   * For each directory scanned plugins can live in either the `plugins` or
   * `node_modules` subdirectories
   *
   * @since 3.0.0
   * @alias lando.plugins.load
   * @param {String} plugin The name of the plugin
   * @param {Array} dirs The directories to scan for plugins.
   * @param {Object} [injected] An object to inject into the plugin.
   * @return {Promise} A Promise.
   * @example
   * // Load the plugin called 'shield-generator' and scan `/tmp` for the plugin
   * return lando.plugins.load('shield-generator', ['/tmp']);
   */
  load(plugin, dirs, injected = {}) {
    // Find our module path
    return this.findPlugin(plugin, dirs)
    // Load the plugin if we have a path
    .then(pluginPath => {
      // If we couldn't find a plugin then warn the user
      if (!pluginPath) this.log.warn('Could not find plugin %s in %s', plugin, pluginPath);
      // Try to load the plugin
      else {
        // Kick off the chain and try to require
        return Promise.try(() => dynamicRequire()(pluginPath)(injected))
        // If success report that and cache the path
        .then(() => {
          // Add to loaded modules (this is mostly for testing).
          this.loadedModules.push(pluginPath);
          this.loadedModules = _.uniq(this.loadedModules);
          this.log.verbose('Plugin %s loaded from %s', plugin, pluginPath);
        })
        // Catch any load failures
        .catch(err => {
          return Promise.reject(Error(err));
        });
      }
    });
  };
};
