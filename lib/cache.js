/**
 * Cache module.
 *
 * @name cache
 */

'use strict';

// Modules
var log = require('./logger');
var NodeCache = require('node-cache');
var _cache = new NodeCache();

/**
 * Override set to add logging
 */
exports.set = function(key, val) {

  // Try to set cache
  if (_cache.set(key, val)) {
    log.debug('Cached %j with key %s', val, key);
  }

  // Report failed cache set
  else {
    log.debug('Failed to cache %j with key %s', val, key);
  }

};

/**
 * Override get to add logging
 */
exports.get = function(key) {

  // Try to get cache
  if (_cache.get(key) === undefined) {
    log.debug('Cache miss with key %s', key);
  }

  // Report failed cache set
  else {
    log.debug('Retrieved from cache with key %s', key);
    return _cache.get(key);
  }

};

/**
 * Override del to add logging
 */
exports.remove = function(key) {

  // Try to get cache
  if (_cache.del(key) === 1) {
    log.debug('Removed key %s from cache.', key);
  }

};
