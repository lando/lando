'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const glob = require('glob');
const Log = require('./logger');
const path = require('path');

// Helper for dynamic requires
// eslint-disable-next-line
const dynamicRequire = () => (typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require);

module.exports = class Plugins {
  constructor(log = new Log()) {
    this.loadedPlugins = [];
    this.log = log;
  }

  /*
   * Helper function to find plugin location
   */
  find(dirs, {disablePlugins = []}) {
    return _(dirs)
    .map(dir => path.join(dir, 'plugins'))
    .filter(dir => fs.existsSync(dir))
    .flatMap(dir => glob.sync(path.join(dir, '**', 'index.js')))
    .map(file => ({name: _.last(path.dirname(file).split(path.sep)), path: file, dir: path.dirname(file)}))
    .filter(plugin => !_.includes(disablePlugins, plugin.name))
    .groupBy('name')
    .map(plugin => _.last(plugin))
    .value();
  };

  /**
   * Loads a plugin.
   *
   * @since 3.0.0
   * @alias lando.plugins.load
   * @param {Object} plugin A plugin object with name and path
   * @param {Object} [injected] An object to inject into the plugin.
   * @return {Promise} A Promise.
   * @example
   * // Load the plugin called 'shield-generator' and scan `/tmp` for the plugin
   * return lando.plugins.load('shield-generator', ['/tmp']);
   */
  load(plugin, injected = {}) {
    // @TODO: is that really how we want to do this?
    // @TODO: need a way to determine whether injected is an app or lando?
    try {
      plugin.data = dynamicRequire()(plugin.path)(injected);
    } catch (e) {
      this.log.error('Problem loading plugin %s from %s', plugin.name, plugin.path);
    }

    // Scan and load tasks if there are any
    if (fs.existsSync(path.join(plugin.dir, 'tasks'))) {
      _.forEach(fs.readdirSync(path.join(plugin.dir, 'tasks')), file => {
        const task = {name: path.basename(file, '.js'), path: path.join(plugin.dir, 'tasks', file)};
        injected.tasks.add(task.name, require(task.path)(injected));
      });
    }

    // @TODO
    // autoload services/recipes/methods

    // Merge in config
    if (_.has(plugin, 'data.config')) {
      injected.config = injected.utils.merge(plugin.data.config, injected.config);
    }
    // Merge in global app env
    if (_.has(plugin, 'data.env')) {
      injected.config.appEnv = injected.utils.merge(plugin.data.env, injected.config.appEnv);
    }
    // Merge in app env
    if (_.has(plugin, 'data.labels')) {
      injected.config.appLabels = injected.utils.merge(plugin.data.labels, injected.config.appLabels);
    }

    // Auto move any scripts or helpers
    // @TODO do we want to do this here? doesnt seem to slow things down too much
    _.forEach(['helpers', 'scripts'], type => {
      if (fs.existsSync(path.join(plugin.dir, type))) {
        const src = path.join(plugin.dir, type);
        const dest = path.join(injected.config.userConfRoot, type);
        this.log.verbose('Copying config from %s to %s', src, dest);
        injected.utils.moveConfig(src, dest);
      }
    });

    // Document the greatesuccess
    this.loadedPlugins.push(plugin);
    this.log.verbose('Plugin %s loaded from %s', plugin.name, plugin.path);
    this.log.debug('Plugin %s has %j', plugin.name, plugin.data);
    return plugin;
  };
};
