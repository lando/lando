/**
 * Helpers to build the the engine config.
 *
 * @since 3.0.0
 * @module env
 * @example
 *
 * // Get the config helpers
 * var dockerBinPath = env.getDockerBinPath();
 */

'use strict';

// Modules
var _ = require('lodash');

/**
 * Translate a name for use by docker-compose eg strip `-` and `.` and
 * @TODO: possibly more than that
 *
 * @since 3.0.0
 */
exports.dockerComposify = function(data) {
  return data.replace(/-/g, '').replace(/\./g, '');
};

/**
 * Escapes any spaces in a command.
 *
 * @since 3.0.0
 * @param {Array} s - A command as elements of an Array or a String.
 * @return {String} The space escaped cmd.
 * @example
 *
 * // Escape the spaces in the cmd
 * var escapedCmd = lando.shell.escSpaces(['git', 'commit', '-m', 'my message']);
 */
exports.escSpaces = function(s, platform) {

  var p = platform || process.platform;

  if (_.isArray(s)) {
    s = s.join(' ');
  }
  if (p === 'win32') {
    return s.replace(/ /g, '^ ');
  }
  else {
    return s.replace(/ /g, '\ ');
  }
};

/*
 * Helper to return a valid id from app data
 */
exports.getId = function(c) {
  return c.cid || c.id || c.containerName || c.containerID || c.name;
};

/*
 * We might have datum but we need to wrap in array so Promise.each knows
 * what to do
 */
exports.normalizer = function(data) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  return data;
};
