'use strict';

// Modules
const _ = require('lodash');
const os = require('os');

/**
 * Returns the id of the current user or username.
 *
 * Note that on Windows this value is more or less worthless and `username` has
 * has no effect
 *
 * @since 3.0.0
 * @alias lando.user.getUid
 * @return {String} The user ID.
 * @example
 * // Get the id of the user.
 * const userId = lando.user.getUid();
 */
exports.getUid = () => (process.platform === 'win32') ? '1000' : _.toString(os.userInfo().uid);

/**
* Returns the gid of the current user or username.
*
* Note that on Windows this value is more or less worthless and `username` has
* has no effect
 *
 * @since 3.0.0
 * @alias lando.user.getGid
 * @return {String} The group ID.
 * @example
 * // Get the id of the user.
 * const groupId = lando.user.getGid();
 */
exports.getGid = () => (process.platform === 'win32') ? '1000' : _.toString(os.userInfo().gid);

/**
* Returns the username of the current user
*
* Note that on Windows this value is more or less worthless and `username` has
* has no effect
 *
 * @since 3.0.0
 * @alias lando.user.getGid
 * @return {String} The group ID.
 * @example
 * // Get the id of the user.
 * const groupId = lando.user.getGid();
 */
exports.getUsername = () => os.userInfo().username;
