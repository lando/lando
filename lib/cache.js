/**
 * Contains caching functions.
 *
 * @since 3.0.0
 * @module cache
 * @example
 *
 * // Add an item to the cache
 * lando.cache.set('mykey', data);
 *
 * // Get an item from the cache
 * var value = lando.cache.get('mykey');
 *
 * // Remove an item from the cache
 * lando.cache.remove('mykey');
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
 * Sets an item in the cache
 *
 * @since 3.0.0
 * @param {String} key - The name of the key to store the data with.
 * @param {Any} data - The data to store in the cache.
 * @param {Object} [opts] - Options to pass into the cache
 * @param {Boolean} [opts.persist=false] - Whether this cache data should persist between processes. Eg in a file instead of memory
 * @param {Integer} [opts.ttl=0] - Seconds the cache should live. 0 mean forever.
 * @example
 *
 * // Add a string to the cache
 * lando.cache.set('mykey', 'mystring');
 *
 * // Add an object to persist in the file cache
 * lando.cache.set('mykey', data, {persist: true});
 *
 * // Add an object to the cache for five seconds
 * lando.cache.set('mykey', data, {ttl: 5});
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
    log.debug('Cached %j with key %s for %j', data, key, opts);
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
 * Gets an item in the cache
 *
 * @since 3.0.0
 * @param {String} key - The name of the key to retrieve the data.
 * @return {Any} The data stored in the cache if applicable.
 * @example
 *
 * // Get the data stored with key mykey
 * var data = lando.cache.get('mykey');
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
 * Manually remove an item from the cache.
 *
 * @since 3.0.0
 * @param {String} key - The name of the key to remove the data.
 * @example
 *
 * // Remove the data stored with key mykey
 * lando.cache.remove('mykey');
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
