'use strict';

// Modules
var _ = require('lodash');
var fs = require('fs-extra');
var jsonfile = require('jsonfile');
var Log = require('./logger');
var NodeCache = require('node-cache');
var os = require('os');
var path = require('path');
var util = require('util');

/*
 * Creates a new Cache instance.
 *
 * @param {object} opts
 * @return
 */
function Cache(opts) {

  opts = opts || {};

  // Get the nodecache opts
  NodeCache.call(this);

  // Set some things
  this.log = opts.log || new Log();
  this.cacheDir = opts.cacheDir || path.join(os.tmpdir(), '.cache');

  // Ensure the cache dir exists
  fs.mkdirpSync(this.cacheDir);

}

/*
 * Inherit from NodeCache.
 */
util.inherits(Cache, NodeCache);

/*
 * Stores the old get method.
 */
Cache.prototype.__get = Cache.prototype.get;

/*
 * Stores the old set method.
 */
Cache.prototype.__set = Cache.prototype.set;

/*
 * Stores the old del method.
 */
Cache.prototype.__del = Cache.prototype.del;

/**
 * Sets an item in the cache
 *
 * @since 3.0.0
 * @alias 'lando.cache.set'
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
Cache.prototype.set = function(key, data, opts) {

  // Defaults opts
  var defaults = {
    persist: false,
    ttl: 0
  };

  // Merge opts over over our defaults
  opts = _.merge(defaults, opts);

  // Translate key for windows
  // @todo: Should we just use `.` as a seperator for all cache keys and remove the platform consideration?
  // @todo: The above plus maybe a warning about non-compliant characters?
  if (process.platform === 'win32') {
    key = key.replace(/:/g, '.');
  }

  // Try to set cache
  if (this.__set(key, data, opts.ttl)) {
    this.log.debug('Cached %j with key %s for %j', data, key, opts);
  }

  // Report failed cache set
  else {
    this.log.debug('Failed to cache %j with key %s', data, key);
  }

  // And add to file if we have persistence
  if (opts.persist) {
    jsonfile.writeFileSync(path.join(this.cacheDir, key), data);
  }

};

/**
 * Gets an item in the cache
 *
 * @since 3.0.0
 * @alias 'lando.cache.get'
 * @param {String} key - The name of the key to retrieve the data.
 * @return {Any} The data stored in the cache if applicable.
 * @example
 *
 * // Get the data stored with key mykey
 * var data = lando.cache.get('mykey');
 */
Cache.prototype.get = function(key) {

  // Translate key for windows
  // @todo: Should we just use `.` as a seperator for all cache keys and remove the platform consideration?
  // @todo: The above plus maybe a warning about non-compliant characters?
  if (process.platform === 'win32') {
    key = key.replace(/:/g, '.');
  }

  // Get from cache
  var memResult = this.__get(key);

  // Return result if its in memcache
  if (memResult) {
    this.log.debug('Retrieved from memcache with key %s', key);
    return memResult;
  }

  // Then try file cache
  else {
    try {
      this.log.debug('Trying to retrieve from file cache with key %s', key);
      return jsonfile.readFileSync(path.join(this.cacheDir, key));
    }
    catch (e) {
      this.log.debug('File cache miss with key %s', key);
    }
  }

};

/**
 * Manually remove an item from the cache.
 *
 * @since 3.0.0
 * @alias 'lando.cache.remove'
 * @param {String} key - The name of the key to remove the data.
 * @example
 *
 * // Remove the data stored with key mykey
 * lando.cache.remove('mykey');
 */
Cache.prototype.remove = function(key) {

  // Translate key for windows
  // @todo: Should we just use `.` as a seperator for all cache keys and remove the platform consideration?
  // @todo: The above plus maybe a warning about non-compliant characters?
  if (process.platform === 'win32') {
    key = key.replace(/:/g, '.');
  }

  // Try to get cache
  if (this.__del(key) === 1) {
    this.log.debug('Removed key %s from memcache.', key);
  }

  // Also remove file if applicable
  try {
    fs.unlinkSync(path.join(this.cacheDir, key));
  }
  catch (e) {
    this.log.debug('No file cache with key %s', key);
  }

};

/*
 * Return the class
 */
module.exports = Cache;
