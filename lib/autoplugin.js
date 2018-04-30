/**
 * This adds loading of plugins from within project
 *
 * @name plugin-loader
 */

'use strict';

const fs = require('fs'),
  path = require('path');

const REQUIRED_SUBDIRECTORIES = [
  'plugins',
  'node_modules'
];

const DEFAULT_PATH = ['./'];

class Autoplugin {
  constructor(lando) {
    this.lando = lando;
  }

  static isLandoPlugin(pathToPlugin) {
    const pluginConfigPath = path.join(pathToPlugin, '.lando.config.yml');

    return fs.existsSync(pathToPlugin) && fs.existsSync(pluginConfigPath);
  }

  static findPlugins(source) {
    return [].concat(...REQUIRED_SUBDIRECTORIES
      .filter(pluginBase => fs.existsSync(path.join(source, pluginBase)))
      .map(pluginBase => fs.readdirSync(path.join(source, pluginBase))
        .map(name => path.join(source, pluginBase, name))
        .filter(source => fs.lstatSync(source).isDirectory())
      ));
  }

  static extractPluginName(relativePath) {
    return path.basename(relativePath);
  }

  getAppConfig() {
    return this.lando.yaml.load(this.getAppYmlPath());
  }

  getAppYmlPath() {
    return path.join(this.lando.config.srcRoot, '.lando.yml');
  }

  listPlugins() {
    return this.listPluginDirectories()
      .filter(Autoplugin.isLandoPlugin)
      .map(Autoplugin.extractPluginName);
  }

  listPluginDirectories() {
    // Flatten array of directories after mapping
    return [].concat(...this.getPaths()
      .map(pluginDirectory => Autoplugin.findPlugins(path.join(process.cwd(), pluginDirectory)))
    );
  }

  getPaths() {
    if (this.isEnabled()) return [];

    return this.isCustomPath() ? this.getAutopluginConfig() : DEFAULT_PATH;
  }

  isEnabled() {
    return !this.getAutopluginConfig();
  }

  getAutopluginConfig() {
    return this.getAppConfig().autoplugin;
  }

  isCustomPath() {
    return Array.isArray(this.getAppConfig().autoplugin);
  }

  getAbsolutePaths() {
    return this.getPaths().map(function (relativePath) {
      return path.join(process.cwd(), relativePath);
    });
  }

}

module.exports = function (lando) {
  return new Autoplugin(lando);
};
