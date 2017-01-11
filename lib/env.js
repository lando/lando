/**
 * Module to handle the environment.
 *
 * @name env
 */

'use strict';

// Modules
var os = require('os');
var path = require('path');
var _ = require('./node')._;

// Constants
var LANDO_SYS_CONF_DIRNAME = '.lando';

/**
 * Document
 */
exports.platform = process.platform;

/**
 * Document
 * @memberof env
 */
exports.setEnv = function(key, value) {
  process.env[key] = value;
};

/**
 * Document
 */
exports.setEnvFromObj = function(data, identifier) {

  // Prefix our keys with proper namespaces
  var prefix = ['LANDO'];

  // If we have an additional identifier then add it in
  if (identifier) {
    prefix.push(identifier.toUpperCase());
  }

  // Build our namespace
  var namespace = prefix.join('_');

  _.forEach(data, function(value, key) {
    var envVar = [namespace, _.snakeCase(key).toUpperCase()].join('_');
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    this.setEnv(envVar, value);
  });
};

/**
 * Document
 */
exports.getHomeDir = function() {
  return os.homedir();
};

/**
 * Document
 */
exports.getUserConfRoot = function() {
  return path.join(this.getHomeDir(), LANDO_SYS_CONF_DIRNAME);
};

/**
 * Document
 */
exports.getSysConfRoot = function() {

  // Win path
  var win = process.env.LANDO_INSTALL_PATH || 'C:\\Program Files\\Lando';

  // Return sysConfRoot based on path
  switch (process.platform) {
    case 'win32': return win;
    case 'darwin': return '/Applications/Lando.app/Contents/MacOS';
    case 'linux': return '/usr/share/lando';
  }

};

/**
 * Document
 */
exports.getSourceRoot = function() {
  return path.resolve(__dirname, '..');
};
