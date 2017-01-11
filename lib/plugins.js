/**
 * Module for loading of plugins and external modules. Handles injecting the
 * main Kalabox api into the modules.
 *
 * @name require
 */

'use strict';

// Modules
var _ = require('./node')._;
var config = require('./config')();
var fs = require('./node').fs;
var path = require('path');
var Promise = require('./promise');

/**
 * Load module and inject kalabox api into module.
 */
exports.load = function(plugin) {

  // List of dirs that we want to check for plugins
  var dirs = [
    config.srcRoot,
    config.sysConfRoot,
    config.userConfRoot
  ];

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
  var paths = flattenMap(dirs, function(dir) {
    return _.map(subDirs, function(subDir) {
      return path.join(dir, subDir, plugin, 'index.js');
    });
  });

  // Filter paths by existance.
  return Promise.filter(paths, fs.existsSync).all()

  // Grabs the last path so that we load things from SRC -> SYS -> USER
  .then(function(paths) {
    return _.last(paths);
  })

  // If a path exists try to require it.
  .then(function(path) {
    if (path) {
      return Promise.try(function() {
        var lando = require('./lando');
        return require(path)(lando);
      })
      .catch(function(err) {
        // Decorate the error.
        throw new Error(path, err);
      });
    }
  });

};
