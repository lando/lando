/**
 * Module to handle the environment.
 *
 * @name env
 */

'use strict';

// Modules
var _ = require('./node')._;
var shell = require('sync-exec');

/**
 * Document
 */
exports.getEngineUserId = function() {
  if (process.platform !== 'linux') {
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
 * Document
 */
exports.getEngineUserGid = function() {
  if (process.platform !== 'linux') {
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
