/**
 * Generates and returns the global config object
 *
 * @since 3.0.0
 * @module config
 * @example
 *
 * // Get the config
 * var config = lando.config;
 */

'use strict';

// Modules
var _ = require('./node')._;
var env = require('./env');
var fs = require('./node').fs;
var os = require('os');
var path = require('path');
var user = require('./user');
var yaml = require('js-yaml');

// Set our deepest of deep core config
var APP_ROOT_DIRNAME = process.env.LANDO_CORE_APP_ROOT_DIRNAME || 'Lando';
var CONFIG_FILENAME = process.env.LANDO_CORE_CONFIG_FILENAME || 'config.yml';
var ENV_PREFIX = process.env.LANDO_CORE_ENV_PREFIX || 'LANDO_';
var LANDOFILE_NAME = process.env.LANDO_CORE_LANDOFILE_NAME || '.lando.yml';

/*
 * Define default config
 */
var getDefaultConfig = function() {

  // Grab version things
  var packageJson = require(path.join(env.srcRoot, 'package.json'));

  var config = {
    appConfigFilename: LANDOFILE_NAME,
    appsRoot: path.join(env.home, APP_ROOT_DIRNAME),
    appRegistry: path.join(env.userConfRoot, 'appRegistry.json'),
    cache: true,
    composeBin: env.composeBin,
    composeVersion: '3.2',
    configFilename: CONFIG_FILENAME,
    containerGlobalEnv: {},
    dockerBin: env.dockerBin,
    dockerBinDir: env.dockerBinDir,
    engineId: user.getEngineUserId(),
    engineGid: user.getEngineUserGid(),
    env: env.env,
    home: env.home,
    logLevel: 'debug',
    logLevelConsole: 'info',
    loadPassphraseProtectedKeys: false,
    node: process.version,
    os: {
      type: os.type(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch()
    },
    stats: [{
      report: true,
      url: 'http://metrics.devwithlando.io'
    }],
    srcRoot: env.srcRoot,
    sysConfRoot: env.sysConfRoot,
    userConfRoot: env.userConfRoot,
    version: packageJson.version
  };

  // Return default config
  return config;

};

/*
 * Merge in config file if it exists
 */
var mergeConfigFile = function(file) {

  // Merge in file if it exists
  if (fs.existsSync(file)) {
    return yaml.safeLoad(fs.readFileSync(file));
  }

  // Return emptiness
  return {};

};

/*
 * Merge in env vars if they exists
 */
var mergeEnvVars = function() {

  // Start an object of our env
  var envConfig = {};

  // Build object of lando_ envvars
  _.forEach(process.env, function(value, key) {
    if (_.includes(key, ENV_PREFIX)) {

      // Add to our config object
      envConfig[_.camelCase(_.trimStart(key, ENV_PREFIX))] = value;

    }
  });

  // Return our findings
  return envConfig;

};

/*
 * Validate our config
 */
var validateConfig = function(config) {

  // Make sure we have something needed
  if (_.isEmpty(config)) {
    // throw new Error('Need to define something');
  }

  // return our config
  return config;

};

/*
 * Get config
 */
var getConfig = _.memoize(function() {

  // Start with the default config
  var config = getDefaultConfig();

  // Check for other config soruces
  var configSources = [
    path.join(config.srcRoot, CONFIG_FILENAME),
    path.join(config.sysConfRoot, CONFIG_FILENAME),
    path.join(config.userConfRoot, CONFIG_FILENAME)
  ];

  // Check to see if we have more config files and merge those in
  _.forEach(configSources, function(file) {
    config = _.merge(config, mergeConfigFile(file));
  });

  // Check for ENV values and merge those in as well
  config = _.merge(config, mergeEnvVars());

  // Return our config
  return validateConfig(config);

});

/*
 * Export func to get conf
 */
module.exports = getConfig();
