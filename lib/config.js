/**
 * Main config module
 *
 * @name config
 */

'use strict';

// Modules
var _ = require('./node')._;
var env = require('./env');
var fs = require('./node').fs;
var os = require('os');
var path = require('path');
var user = require('./user');
var yaml = require('./node').yaml;

// "Constants"
var CONFIG_FILENAME = 'lando.yml';
var ENV_PREFIX = 'LANDO_';

/*
 * Define default config
 */
var getDefaultConfig = function() {

  // Grab version things
  var packageJson = require(path.join(env.getSourceRoot(), 'package.json'));

  // Check whether we are in a jx core binary or not
  var isBinary = (process.isPackaged || process.IsEmbedded) ? true : false;

  // Check whether we are in NW or not
  var isNw = _.has(process.versions, 'node-webkit');

  var config = {
    cache: true,
    engineId: user.getEngineUserId(),
    engineGid: user.getEngineUserGid(),
    home: env.getHomeDir(),
    isBinary: isBinary || isNw,
    isNW: isNw,
    logLevel: 'debug',
    logLevelConsole: 'info',
    os: {
      type: os.type(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch()
    },
    stats: {
      report: true,
      url: 'http://stats-v2.kalabox.io'
    },
    srcRoot: env.getSourceRoot(),
    sysConfRoot: env.getSysConfRoot(),
    userConfRoot: env.getUserConfRoot(),
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

  // Make sure we have quandl apikey
  if (_.isEmpty(config)) {
    //throw new Error('Need to define quandlApiKey');
  }

  // return our config
  return config;

};

/*
 * Export func to get conf
 */
module.exports = _.memoize(function() {

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
