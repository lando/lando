'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');

/*
 * Returns the sysConfRoot based on path.
 */
const getSysConfRoot = function() {

  // Either load the path from LANDO_INSTALL_PATH or default to Program Files.
  const win = process.env.LANDO_INSTALL_PATH || 'C:\\Program Files\\Lando';

  // Return sysConfRoot based on path
  switch (process.platform) {
    case 'win32': return win;
    case 'darwin': return '/Applications/Lando.app/Contents/MacOS';
    case 'linux': return '/usr/share/lando';
  }

};

/*
 * Determine whether we are in a browser or cli
 *
 * While setting the config.mode is helpful this is a deeper check so that we
 * know how to handle the process object in things shell attaching, stream piping
 * stdin reading, etc
 *
 * @TODO: We might want to either expand the version checks or maybe do a lower
 * level check of the process file descriptors
 */
const processType = function() {

  // Collect some info on things we have
  const isElectron = _.has(process, 'versions.electron', false);
  const isChrome = _.has(process, 'versions.chrome', false);
  const isAtom = _.has(process, 'versions.atom-shell', false);

  // If any of the above are true return the type
  return (isElectron || isChrome || isAtom) ? 'browser' : 'node';

};

/**
 * Document @todo
 * @since 3.0.0
 * @alias 'lando.utils.config.tryConvertJson'
 */
exports.tryConvertJson = function(value) {
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
 * @param {Object} old object to be merged
 * @param {Object} fresh object to be merged
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.merge'
 * @example
 *
 * // Take an object and write a docker compose file
 * var newObject = _.mergeWith(a, b, lando.utils.merger);
 *
 * @returns {Object} Merged object or arrays
 */
exports.merge = function(old, fresh) {
  return _.mergeWith(old, fresh, function(s, f) {
    if (_.isArray(s)) {
      return _.uniq(s.concat(f));
    }
  });
};

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
exports.stripEnv = function(prefix) {

  // Strip it down
  _.each(process.env, function(value, key) {
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
 */
exports.defaults = function() {

  // Grab version things
  const configFilename = 'config.yml';
  const srcRoot = path.resolve(__dirname, '..');

  // The default config
  const config = {
    configFilename: configFilename,
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
    process: processType(),
    srcRoot: srcRoot,
    sysConfRoot: getSysConfRoot(),
    userConfRoot: path.join(os.homedir(), '.lando')
  };

  // Also add some info to the process so we can use this elsewhere
  process.lando = config.process;

  // Return default config
  return config;

};

/**
 * Merge in config file if it exists
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.loadFiles'
 */
exports.loadFiles = function(files) {

  // Start collecting
  const conf = {};

  // Merge all the files on top of one another, last file is last merged and
  // has precedent
  _.forEach(files, function(file) {
    if (fs.existsSync(file)) {
      conf = exports.merge(conf, yaml.safeLoad(fs.readFileSync(file)));
    }
  });

  // Return
  return conf;

};

/**
 * Filter process.env by a given prefix
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.loadEnvs'
 * @param {String} prefix - The prefix by which to filter. Should be without the trailing `_` eg `LANDO` not `LANDO_`
 * @returns {Object} Object of things with camelCased keys
 */
exports.loadEnvs = function(prefix) {
  return _(process.env)
    // Only muck with prefix_ variables
    .pickBy((value, key) => _.includes(key, prefix))
    // Prep the keys for consumption
    .mapKeys((value, key) => _.camelCase(_.trimStart(key, prefix)))
    // If we have a JSON string as a value, parse that and assign its sub-keys
    .mapValues(exports.tryConvertJson)
    // Resolve the lodash wrapper
    .value();
};
