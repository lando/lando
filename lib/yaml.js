/**
 * Contains yaml functions.
 *
 * @since 3.0.0
 * @module yaml
 * @todo: Better logging here?
 * @example
 *
 * // Add a string to the cache
 * var thing = lando.yaml.load('/tmp/myfile.yml');
 */

'use strict';

// Modules
var fs = require('./node').fs;
var log = require('./logger');
var path = require('path');
var yaml = require('js-yaml');

/**
 * Loads a yaml object from a file
 *
 * @since 3.0.0
 * @param {String} file - The path to the file to be loaded
 * @return {Object} The loaded object
 * @example
 *
 * // Add a string to the cache
 * var thing = lando.yaml.load('/tmp/myfile.yml');
 */
exports.load = function(file) {

  // Try to load the file
  try {
    return yaml.safeLoad(fs.readFileSync(file));
  }

  // If not warn the user of some sort of parse error
  catch (e) {
    log.error('Problem parsing %s with %s', file, e.message);
  }

};

/**
 * Dumps an object to a YAML file
 *
 * @since 3.0.0
 * @param {String} file - The path to the file to be loaded
 * @param {Object} data - The object to dump
 */
exports.dump = function(file, data) {

  // Make sure we have a place to store these files
  fs.mkdirpSync(path.dirname(file));

  // Remove any properties that might be bad and dump
  data = JSON.parse(JSON.stringify(data));

  // And dump
  fs.writeFileSync(file, yaml.safeDump(data));

};
