/**
 * Cache module.
 *
 * @name cache
 */

'use strict';

// Modules
var _ = require('./node')._;
var config = require('./config');
var fs = require('./node').fs;
var jsonfile = require('./node').jsonfile;
var log = require('./logger');
var NodeCache = require('node-cache');
var path = require('path');
var _cache = new NodeCache();

// Ensure that cache directory exists
var cacheDir = path.join(config.userConfRoot, 'cache');
fs.mkdirpSync(path.join(cacheDir));

/**
 * Override set to add logging
 */
exports.set = function(key, data, opts) {

  // Defaults opts
  var defaults = {
    persist: false,
    ttl: 0
  };

  // Merge opts over over our defaults
  opts = _.merge(defaults, opts);

  // Try to set cache
  if (_cache.set(key, data, opts.ttl)) {
    log.debug('Cached %j with key %s for %s', data, key, opts);
  }

  // And add to file if we have persistence
  if (opts.persist) {
    jsonfile.writeFileSync(path.join(cacheDir, key), data);
  }

  // Report failed cache set
  else {
    log.debug('Failed to cache %j with key %s', data, key);
  }

};

/**
 * Override get to add logging
 */
exports.get = function(key) {

  // Get from cache
  var memResult = _cache.get(key);

  // Return result if its in memcache
  if (memResult) {
    log.debug('Retrieved from memcache with key %s', key);
    return memResult;
  }

  // Then try file cache
  else {
    try {
      log.debug('Retrieved from file cache with key %s', key);
      return jsonfile.readFileSync(path.join(cacheDir, key));
    }
    catch (e) {
      log.debug('Cache miss with key %s', key);
    }
  }

};

/**
 * Override del to add logging
 */
exports.remove = function(key) {

  // Try to get cache
  if (_cache.del(key) === 1) {
    log.debug('Removed key %s from memcache.', key);
  }

  // Also remove file if applicable
  try {
    fs.unlinkSync(path.join(cacheDir, key));
  }
  catch (e) {
    log.debug('No file cache with key %s', key);
  }

};
