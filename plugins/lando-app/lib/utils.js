/**
 * Helpers for app things.
 *
 * @since 3.0.0
 * @module utils
 */

'use strict';

// Modules
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');

/**
 * Checks if there is already an app with the same name in an app _registry
 * object
 *
 * @since 3.0.0
 */
exports.appNameExists = function(apps, app) {
  return _.some(apps, function(a) {
    return a.name === app.name;
  });
};

/**
 * Validates compose files returns legit ones
 *
 * @since 3.0.0
 */
exports.validateFiles = function(files, root) {

  // Handle args
  if (typeof files === 'string') {
    files = [files];
  }
  root = root || process.cwd();

  // Return a list of absolute paths that exists
  return _.compact(_.map(files, function(file) {

    // Check if absolute
    if (!path.isAbsolute(file)) {
      file = path.join(root, file);
    }

    // Check existence
    if (fs.existsSync(file)) {
      return file;
    }

  }));

};

/**
 * Takes data and spits out a compose object
 *
 * @since 3.0.0
 */
exports.compose = function(version, services, volumes, networks) {
  return {
    version: version,
    services: services,
    volumes: volumes,
    networks: networks
  };
};
