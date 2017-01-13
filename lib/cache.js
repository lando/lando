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
var jsonfile = require('./node').json;
var log = require('./logger');
var path = require('path');

// Cache
var cache = {};

/*
 * Return basepath
 */
var getBasePath = function() {
  return path.join(config.userConfRoot, 'cache');
};

/*
 * Return registry
 */
var getRegistry = function() {
  return path.join(getBasePath(), 'registry.json');
};

/*
 * Get a cache file
 */
var getFile = function(path) {
  try {
    return jsonfile.readFileSync(path);
  }
  catch (e) {
    return {};
  }
};

/*
 * Set the cache registry
 */
var setFile = function(file, data) {
  fs.mkdirpSync(path.dirname(file));
  jsonfile.writeFileSync(file, data);
};

/*
 * Add entry to registry
 */
var addRegistry = function(key, expires) {
  var registry = getFile(getRegistry());
  registry[key] = expires;
  setFile(getRegistry(), registry);
  log.debug('Cache object %s set to expire at %s.', key, expires);
};

/*
 * Remove entry to registry
 */
var removeRegistry = function(key) {
  var registry = getFile(getRegistry());
  delete registry[key];
  setFile(getRegistry(), registry);
};

/*
 * Removes data from the cache
 */
var remove = function(key) {
  delete cache[key];
  try {
    fs.unlinkSync(path.join(getBasePath(), key));
  }
  catch (e) {}
  removeRegistry(key);
  log.debug('Removing cache entry %s', key);
};

/**
 * Return data from the cache if it exists
 */
exports.get = function(key) {

  // Check to see if our entry has expired or not
  if (getFile(getRegistry())[key] < Date.now() || !config.cache) {
    log.debug('Cache object %s expired. Recaching...', key);
    remove(key);
  }

  // Pull from the cache
  if (!_.isEmpty(cache[key])) {
    log.debug('Found data in memcache index %s', key);
    return cache[key];
  }
  else if (!_.isEmpty(getFile(path.join(getBasePath(), key)))) {
    log.debug('Found data in filecache index %s', key);
    return getFile(path.join(getBasePath(), key));
  }
  else {
    log.debug('No cached data found at index %s', key);
  }

};

/**
 * Add data to the cache
 */
exports.set = function(key, data, memonly) {

  // set memonly default
  memonly = memonly || false;

  // Add to memcache
  cache[key] = data;
  log.debug('Setting data in memcache at index %s', key);

  // Add to file cache unless memonly
  if (memonly) {
    setFile(path.join(getBasePath(), key), data);
    addRegistry(key, Date.now() + 86400);
    log.debug('Setting data in filecache at index %s', key);
  }

};
