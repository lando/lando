'use strict';

// Modules
var fs = require('fs-extra');
var Log = require('./logger');
var path = require('path');
var yaml = require('js-yaml');
var _ = require('lodash');

module.exports = function(logger) {

  // Set up the logger
  var log = logger || new Log();

  /**
   * Loads a yaml object from a file
   *
   * @since 3.0.0
   * @alias 'lando.yaml.load'
   * @param {String} file - The path to the file to be loaded
   * @return {Object} The loaded object
   * @example
   *
   * // Add a string to the cache
   * var thing = lando.yaml.load('/tmp/myfile.yml');
   */
  var load = function(file) {

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
   * @alias 'lando.yaml.dump'
   * @param {String} file - The path to the file to be loaded
   * @param {Object} data - The object to dump
   * @return - Flename
   */
  var dump = function(file, data) {

    // Make sure we have a place to store these files
    fs.ensureDirSync(path.dirname(file));

    // Remove any properties that might be bad and dump
    data = JSON.parse(JSON.stringify(data));

    // And dump
    fs.writeFileSync(file, yaml.safeDump(data));

    // And return filename
    return file;

  };

    /**
     * Loops through the lando config file looking for ${} which are then replaced with values from the matching key.
     *
     * ToDo: Enable nested variable replacements.
     * ToDo: Enable variables to be pulled in from a .env file.
     *
     * @since 3.0.X?
     * @alias 'lando.yaml.replace'
     * @param appConfig {Object} lando configuration object
     * @param appConfigDeep Nested objects to inspect recursively
     * @returns {Object}
     */
  var replace = function (appConfig, appConfigDeep) {
      var varPattern = new RegExp('\\$\\{(.*?)\\}', 'g');
      var currentObj = typeof appConfigDeep !== 'undefined' ? appConfigDeep : appConfig;
      _.forOwn(currentObj, function (i, key) {
        switch (typeof i) {
            case 'string':
                if (varPattern.test(i)) {
                    var parts = i.match(varPattern);
                    parts.forEach(function (part) {
                        currentObj[key] = i.replace(part, appConfig[part.slice(2, part.length - 1)]);
                    });
                }
              break;
            case 'object':
                replace(appConfig, i);
              break;
        }
      });

      return appConfig;
  };

  // Return
  return {
    dump: dump,
    load: load,
    replace: replace
  };

};
