/**
 * Contains some helpers to get information about the user.
 *
 * @since 3.0.0
 * @module user
 * @example
 *
 * // Get the id of the user.
 * var userId = lando.user.getEngineUserId();
 *
 * // Get the group id of the user.
 * var groupId = lando.user.getEngineUserGid();
 */

'use strict';

// Modules
var _ = require('./node')._;
var shell = require('sync-exec');

/**
 * Returns the id of the user.
 *
 * Note that on Windows this value is more or less worthless.
 *
 * @since 3.0.0
 * @returns {String} The user ID.
 * @example
 *
 * // Get the id of the user.
 * var userId = lando.user.getEngineUserId();
 */
exports.getUid = function() {
  if (process.platform === 'win32') {
    return 1000;
  }
  else {
    var id = shell('id -u $(whoami)', {silent:true});
    if (id.status !== 0) {
      throw new Error('Cant get users id');
    }
    else {
      return _.trim(id.stdout);
    }
  }
};

/**
 * Returns the group id of the user.
 *
 * Note that on Windows this value is more or less worthless.
 *
 * @since 3.0.0
 * @returns {String} The group ID.
 * @example
 *
 * // Get the id of the user.
 * var groupId = lando.user.getEngineUserGid();
 */
exports.getGid = function() {
  if (process.platform === 'win32') {
    return 50;
  }
  else {
    var group = shell('id -g', {silent:true});
    if (group.status !== 0) {
      throw new Error('Cant get users gid');
    }
    else {
      return _.trim(group.stdout);
    }
  }
};
