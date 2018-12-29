'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const glob = require('glob');
const Log = require('./logger');
const path = require('path');

// List of autoload locations to scan for
const autoLoaders = [
  'app.js',
  'compose',
  'methods',
  'services',
  'scripts',
  'recipes',
  'tasks',
  'types',
];

// eslint-disable-next-line
const dynamicRequire = () => (typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require);

// Helper to build out a fully fleshed plugin object
const buildPlugin = file => ({
  name: _.last(path.dirname(file).split(path.sep)),
  path: file,
  dir: path.dirname(file),
});

// Helper to discover things in the plugin that can be autoloaded
const discoverPlugin = plugin => _(autoLoaders)
  .map(thing => path.join(plugin.dir, thing))
  .filter(path => fs.existsSync(path))
  .keyBy(file => path.basename(_.last(file.split(path.sep)), '.js'))
  .value();

/*
 * @TODO
 */
module.exports = class Plugins {
  constructor(log = new Log()) {
    this.registry = [];
    this.log = log;
  };

  /*
   * Helper function to find plugin location
   */
  find(dirs, {disablePlugins = []} = {}) {
    return _(dirs)
    .map(dir => path.join(dir, 'plugins'))
    .filter(dir => fs.existsSync(dir))
    .flatMap(dir => glob.sync(path.join(dir, '*', 'index.js')))
    .map(file => buildPlugin(file))
    .filter(plugin => !_.includes(disablePlugins, plugin.name))
    .groupBy('name')
    .map(plugin => _.last(plugin))
    .map(plugin => _.merge({}, plugin, discoverPlugin(plugin)))
    .value();
  };

  /**
   * Loads a plugin.
   *
   * @since 3.0.0
   * @alias lando.plugins.load
   * @param {Object} plugin A plugin object with name and path
   * @param {String} [file=plugin.path] An object to inject into the plugin.
   * @param {Object} [...injected] Things to inject into the plugin
   * @return {Promise} A Promise.
   * @example
   * // Load the plugin called 'shield-generator' and scan `/tmp` for the plugin
   * return lando.plugins.load('shield-generator', ['/tmp']);
   */
  load(plugin, file = plugin.path, ...injected) {
    try {
      plugin.data = dynamicRequire()(file)(...injected);
    } catch (e) {
      this.log.error('Problem loading plugin %s from %s: %s', plugin.name, file, e.stack);
    }

    // Register, log, return
    this.registry.push(plugin);
    this.log.verbose('Plugin %s loaded from %s', plugin.name, file);
    this.log.debug('Plugin %s has %j', plugin.name, plugin.data);
    return plugin;
  };
};
