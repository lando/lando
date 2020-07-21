'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const glob = require('glob');
const Log = require('./logger');
const path = require('path');
const resolver = (process.platform === 'win32') ? path.win32.resolve : path.posix.resolve;

// List of autoload locations to scan for
const autoLoaders = [
  'app.js',
  'compose',
  'methods',
  'scripts',
  'services',
  'sources',
  'recipes',
  'tasks',
  'types',
];

// eslint-disable-next-line
const dynamicRequire = () => (typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require);

// Helper to build out a fully fleshed plugin object
const buildPlugin = file => ({
  name: _.last(resolver(path.dirname(file)).split(path.sep)),
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

  /**
   * Finds plugins
   *
   * @since 3.0.0
   * @alias lando.plugins.find
   * @param {Array} dirs Directories to scan for plugins
   * @param {Object} disablePlugins=[]] Array of plugin names to not load
   * @return {Array} Array of plugin metadata
   */
  find(dirs, {disablePlugins = []} = {}) {
    return _(dirs)
      .map(dir => {
        if (_.isString(dir)) return path.join(dir, 'plugins');
        else return path.join(dir.path, _.get(dir, 'subdir', 'plugins'));
      })
      .filter(dir => fs.existsSync(dir))
      .flatMap(dir => glob.sync(path.join(dir, '*', 'index.js')))
      .map(file => buildPlugin(file))
      .filter(plugin => !_.includes(disablePlugins, plugin.name))
      .groupBy('name')
      .map(plugins => _.last(plugins))
      .map(plugin => _.merge({}, plugin, discoverPlugin(plugin)))
      .value();
  };

  /**
   * Loads a plugin.
   *
   * @since 3.0.0
   * @alias lando.plugins.load
   * @param {String} plugin The name of the plugin
   * @param {String} [file=plugin.path] That path to the plugin
   * @param {Object} [...injected] Something to inject into the plugin
   * @return {Object} Data about our plugin.
   */
  load(plugin, file = plugin.path, ...injected) {
    try {
      plugin.data = dynamicRequire()(file)(...injected);
    } catch (e) {
      this.log.error('problem loading plugin %s from %s: %s', plugin.name, file, e.stack);
    }

    // Register, log, return
    this.registry.push(plugin);
    this.log.debug('plugin %s loaded from %s', plugin.name, file);
    this.log.silly('plugin %s has', plugin.name, plugin.data);
    return plugin;
  };
};
