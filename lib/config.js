'use strict';

// Modules
const _ = require('lodash');
const browsers = ['electron', 'chrome', 'atom-shell'];
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');

/*
 * Determine whether we are in a browser or not
 *
 * While setting the config.mode is helpful this is a deeper check so that we
 * know how to handle the process object in things shell attaching, stream piping
 * stdin reading, etc
 *
 * @TODO: We might want to either expand the version checks or maybe do a lower
 * level check of the process file descriptors
 */
const isBrowser = () =>  _(process.versions)
  .reduce((isBrowser, version, thing) => (isBrowser || _.includes(browsers, thing)), false);

/**
 * Attempt to parse a JSON string to an objects
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.tryConvertJson'
 * @param {String} value The string to convert
 * @returns {Object} A parsed object or the inputted value
 */
exports.tryConvertJson = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

/**
 * Uses _.mergeWith to concat arrays, this helps replicate how Docker
 * https://lodash.com/docs#mergeWith
 * Compose merges its things
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.merge'
 * @param {Object} old object to be merged
 * @param {Object} fresh object to be merged
 * @returns {Object} The new object
 * @example
 *
 * // Take an object and write a docker compose file
 * var newObject = _.mergeWith(a, b, lando.utils.merger);
 *
 * @returns {Object} Merged object or arrays
 */
exports.merge = (old, fresh) => _.mergeWith(old, fresh, (s, f) => {
  if (_.isArray(s)) { return _.uniq(s.concat(f)); }
});

/**
 * Strips process.env of all envvars with PREFIX and returns process.env
 *
 * NOTE: this actually returns process.env not a NEW object cloned from process.env
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.stripEnv'
 * @param {String} prefix - The prefix to strip
 * @returns {Object} Updated process.env
 * @example
 *
 * // Reset the process.env without any DOCKER_ prefixed envvars
 * process.env = config.stripEnv('DOCKER_');
 */
exports.stripEnv = (prefix) => {

  // Strip it down
  _.each(process.env, (value, key) => {
    if (_.includes(key, prefix)) {
      delete process.env[key];
    }
  });

  // Return
  return process.env;

};

/**
 * Define default config
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.defaults'
 * @returns {Object} The default config object.
 */
exports.defaults = () => {

  // Grab version things
  const configFilename = 'config.yml';
  const srcRoot = path.resolve(__dirname, '..');

  // Also add some info to the process so we can use this elsewhere
  process.lando = (isBrowser()) ? 'browser' : 'node';

  // The default config
  return {
    configFilename,
    configSources: [path.join(srcRoot, configFilename)],
    env: process.env,
    home: os.homedir(),
    logLevel: 'debug',
    logLevelConsole: 'warn',
    node: process.version,
    os: {
      type: os.type(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch()
    },
    pluginDirs: [srcRoot],
    product: 'lando',
    process: process.lando,
    srcRoot,
    userConfRoot: path.join(os.homedir(), '.lando')
  };

};

/**
 * Merge in config file if it exists
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.loadFiles'
 * @param {Array} files - An array of files to try loading
 * @returns {Object} An object of config merged from file sources
 */
exports.loadFiles = (files) => _(files)
  // Filter if file exists
  .filter(fs.existsSync)
  // Start collecting
  .reduce((a, file) => exports.merge(a, yaml.safeLoad(fs.readFileSync(file))), {});

/**
 * Filter process.env by a given prefix
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.loadEnvs'
 * @param {String} prefix - The prefix by which to filter. Should be without the trailing `_` eg `LANDO` not `LANDO_`
 * @returns {Object} Object of things with camelCased keys
 */
exports.loadEnvs = (prefix) =>  _(process.env)
  // Only muck with prefix_ variables
  .pickBy((value, key) => _.includes(key, prefix))
  // Prep the keys for consumption
  .mapKeys((value, key) => _.camelCase(_.trimStart(key, prefix)))
  // If we have a JSON string as a value, parse that and assign its sub-keys
  .mapValues(exports.tryConvertJson)
  // Resolve the lodash wrapper
  .value();
