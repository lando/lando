'use strict';

// Modules
const _ = require('lodash');
const shell = require('sync-exec');

/*
 * Helper to get command data
 */
const getId = (cmd, username = '$(whoami)') => {
  // Return 1000 if on windows
  if (process.platform === 'win32') return '1000';
  // Username parsing and command appending
  cmd.push(username);
  // Attempt to grab the data
  const data = shell(cmd.join(' '), {silent: true});
  // Throw if error
  if (data.status !== 0) throw new Error('Cant get data with ' + cmd);
  // Otherwise return
  return _.trim(data.stdout);
};

/**
 * Returns the id of the current user or username.
 *
 * Note that on Windows this value is more or less worthless and `username` has
 * has no effect
 *
 * @since 3.0.0
 * @alias lando.user.getUid
 * @param {String} [username='$(whoami)'] The username to get the ID for
 * @return {String} The user ID.
 * @example
 * // Get the id of the user.
 * const userId = lando.user.getUid();
 */
exports.getUid = username => getId(['id', '-u'], username);

/**
* Returns the id of the current user or username.
*
* Note that on Windows this value is more or less worthless and `username` has
* has no effect
 *
 * @since 3.0.0
 * @alias lando.user.getGid
 * @param {String} [username='$(whoami)'] The username to get the ID for
 * @return {String} The group ID.
 * @example
 * // Get the id of the user.
 * const groupId = lando.user.getGid();
 */
exports.getGid = username => getId(['id', '-g'], username);
