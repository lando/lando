'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
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

    // Let's do some extra stuff if we are injecting lando
    if (injected[0].constructor.name === 'Lando') {
      // Rename just to make things read better
      const lando = injected[0];
      lando.log.debug('Attempting to autoload some things for plugin %s', plugin.name);

      // Autoload tasks if there are any
      if (fs.existsSync(plugin.tasks)) {
        _.forEach(fs.readdirSync(plugin.tasks), file => {
          lando.tasks.add(path.basename(file, '.js'), require(path.join(plugin.tasks, file))(lando));
          lando.log.debug('Autoloaded task %s', path.basename(file, '.js'));
        });
      }

      // Auto move and make executable any scripts
      if (fs.existsSync(plugin.scripts)) {
        const confDir = path.join(lando.config.userConfRoot, 'scripts');
        const dest = lando.utils.moveConfig(plugin.scripts, confDir);
        lando.utils.makeExecutable(fs.readdirSync(dest), dest);
        lando.log.debug('Automoved scripts from %s to %s and setting 755', plugin.scripts, confDir);
      }

      // Autoload various builders into our factory
      _.forEach(['compose', 'types', 'services', 'recipes'], type => {
        if (fs.existsSync(plugin[type])) {
          _.forEach(glob.sync(path.join(plugin[type], '*', 'builder.js')), file => {
            const builder = lando.factory.add(require(file));
            lando.log.debug('Autoloaded %s builder %s', type, builder.name);
          });
        };
      });

      // Auto load our init methods
      // @TODO

      // @TODO: add builder registry to config or something?
      // console.log(lando.factory.get())

      // Merge in config
      if (_.has(plugin, 'data.config')) lando.config = _.merge(plugin.data.config, lando.config);

      // Add plugins to config
      // @NOTE: we remove plugin.data here because circular ref error and because presumably that
      // data is now expessed directly in the lando object somewhere
      lando.config.plugins.push(_.omit(plugin, 'data'));
    }

    // Register, log, return
    this.registry.push(plugin);
    this.log.verbose('Plugin %s loaded from %s', plugin.name, file);
    this.log.debug('Plugin %s has %j', plugin.name, plugin.data);
    return plugin;
  };
};
