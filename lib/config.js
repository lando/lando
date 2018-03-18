'use strict';

/**
 * Configuration module.
 * @module config
 */

// Modules
var _ = require('lodash');
var fs = require('fs-extra');
var os = require('os');
var path = require('path');
var yaml = require('js-yaml');
var _config = this;

/**
 * Returns the sysConfRoot based on path.
 *
 * @returns {String} Returns the system configuration root
 */
var getSysConfRoot = function() {

  // Either load the path from LANDO_INSTALL_PATH or default to Program Files.
  var win = process.env.LANDO_INSTALL_PATH || 'C:\\Program Files\\Lando';

  // Return sysConfRoot based on path
  switch (process.platform) {
    case 'win32': return win;
    case 'darwin': return '/Applications/Lando.app/Contents/MacOS';
    case 'linux': return '/usr/share/lando';
  }

};

/**
 * Collects information on the process to determine whether we are in a browser or cli.
 *
 * While setting the config.mode is helpful this is a deeper check so that we
 * know how to handle the process object in things shell attaching, stream piping
 * stdin reading, etc
 *
 * @TODO: We might want to either expand the version checks or maybe do a lower
 * level check of the process file descriptors
 *
 * @returns {String} String reflecting the process type
 */
var processType = function() {
    // List of known 'browsers'.
    const browsers = ['electron', 'chrome', 'atom-shell'];
    let check = false;

    browsers.forEach(function (item) {
        if (Object.keys(process.versions).indexOf(item) >= 0) {
            check = true;
        }
    });

    // If we detect any of the above 'browsers' as keys return 'browser'.
    return check ? 'browser' : 'node';

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
 * Updates the PATH with dir. This adds dir to the beginning of PATH.
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.updatePath'
 * @param {String} dir - The dir to add
 * @returns {String} Updated PATH string
 * @example
 *
 * // Update the path
 * var config.path = config.updatePath(path);
 *
 * @returns {Object} Merged arrays
 */
exports.updatePath = function(dir) {

  // Determine the path string
  var p = (process.platform === 'win32') ? 'Path' : 'PATH';

  // Update process.env and return the path
  if (!_.startsWith(process.env[p], dir)) {
    process.env[p] = [dir, process.env[p]].join(path.delimiter);
  }

  // Return
  return process.env[p];

};

/**
 * Strips process.env of all envvars with PREFIX
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.stripEnv'
 * @param {String} prefix - The prefix to strip
 * @returns {Object} Updated process.env
 * @example
 *
 * // Reset the process.env without any LANDO_ prefixed envvars
 * process.env = config.stripEnv('LANDO_');
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
  var configFilename = 'config.yml';
  var srcRoot = path.resolve(__dirname, '..');

  // The default config
  var config = {
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

  // Set Path environmental variable if we are on windows so we get access
  // to things like ssh.exe
  // @TODO: is all of this still needed?
  if (process.platform === 'win32') {
    var appData = process.env.LOCALAPPDATA;
    var programFiles = process.env.ProgramFiles;
    var programFiles2 = process.env.ProgramW6432;
    var gitBin1 = path.join(appData, 'Programs', 'Git', 'usr', 'bin');
    var gitBin2 = path.join(programFiles, 'Git', 'usr', 'bin');
    var gitBin3 = path.join(programFiles2, 'Git', 'usr', 'bin');

    // Only add the gitbin to the path if the path doesn't start with
    // it. We want to make sure gitBin is first so other things like
    // putty don't F with it.
    //
    // See https://github.com/kalabox/kalabox/issues/342
    _.forEach([gitBin1, gitBin2, gitBin3], function(gBin) {
      if (fs.pathExistsSync(gBin) && !_.startsWith(process.env.Path, gBin)) {
        process.env.Path = [gBin, process.env.Path].join(';');
      }
    });

  }

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
  var conf = {};

  // Merge all the files on top of one another, last file is last merged and
  // has precedent
  _.forEach(files, function(file) {
    if (fs.pathExistsSync(file)) {
      conf = _config.merge(conf, yaml.safeLoad(fs.readFileSync(file)));
    }
  });

  // Return
  return conf;

};

/**
 * Grab envvars and map to config
 *
 * @since 3.0.0
 * @alias 'lando.utils.config.loadEnvs'
 */
exports.loadEnvs = function(prefix) {

  // Start an object of our env
  var envConfig = {};

  // Build object of lando_ envvars
  _.forEach(process.env, function(value, key) {
    if (_.includes(key, prefix)) {
      envConfig[_.camelCase(_.trimStart(key, prefix))] = value;
    }
  });

  // Return our findings
  return envConfig;

};
