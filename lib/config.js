'use strict';

// Modules
const _ = require('lodash');
const browsers = ['electron', 'chrome', 'atom-shell'];
const env = require('./env');
const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');
const url = require('url');

// Default config
const defaultConfig = {
  composeBin: env.getComposeExecutable(),
  disablePlugins: [],
  dockerBin: env.getDockerExecutable(),
  dockerBinDir: env.getDockerBinPath(),
  env: process.env,
  home: os.homedir(),
  logLevel: 'debug',
  node: process.version,
  os: {
    type: os.type(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
  },
  plugins: [],
  userConfRoot: os.tmpdir(),
};

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
const isBrowser = () => _(process.versions)
  .reduce((isBrowser, version, thing) => (isBrowser || _.includes(browsers, thing)), false);

/*
 * @TODO
 */
const setDockerHost = (hostname, port = 2376) => url.format({
  protocol: 'tcp',
  slashes: true,
  hostname,
  port,
});

/**
 * Attempt to parse a JSON string to an objects
 *
 * @since 3.0.0
 * @alias lando.utils.config.tryConvertJson
 * @param {String} value The string to convert
 * @return {Object} A parsed object or the inputted value
 */
exports.tryConvertJson = value => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

/**
 * Uses _.mergeWith to concat arrays, this helps replicate how Docker Compose
 * merges its things
 *
 * @see https://lodash.com/docs#mergeWith
 * @since 3.0.0
 * @alias lando.utils.config.merge
 * @param {Object} old object to be merged
 * @param {Object} fresh object to be merged
 * @return {Object} The new object
 * @example
 * // Take an object and write a docker compose file
 * const newObject = _.mergeWith(a, b, lando.utils.merger);
 */
exports.merge = (old, ...fresh) => _.mergeWith(old, ...fresh, (s, f) => {
  if (_.isArray(s)) return _.uniq(s.concat(f));
});

/**
 * Strips process.env of all envvars with PREFIX and returns process.env
 *
 * NOTE: this actually returns process.env not a NEW object cloned from process.env
 *
 * @since 3.0.0
 * @alias lando.utils.config.stripEnv
 * @param {String} prefix - The prefix to strip
 * @return {Object} Updated process.env
 * @example
 * // Reset the process.env without any DOCKER_ prefixed envvars
 * process.env = config.stripEnv('DOCKER_');
 */
exports.stripEnv = prefix => {
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
 * @alias lando.utils.config.defaults
 * @return {Object} The default config object.
 */
exports.defaults = () => {
  // Also add some info to the process so we can use this elsewhere
  process.lando = (isBrowser()) ? 'browser' : 'node';
  // The default config
  return _.merge(defaultConfig, {process: process.lando});
};

/*
 * @TODO
 */
exports.getEngineConfig = ({engineConfig = {}, env = {}}) => {
  // Set defaults if we have to
  if (_.isEmpty(engineConfig)) {
    engineConfig = {
      socketPath: (process.platform === 'win32') ? '//./pipe/docker_engine' : '/var/run/docker.sock',
      host: '127.0.0.1',
      port: 2376,
    };
  }
  // Set the docker host if its non-standard
  if (engineConfig.host !== '127.0.0.1') env.DOCKER_HOST = setDockerHost(engineConfig.host, engineConfig.port);
  // Set the TLS/cert things if needed
  if (_.has(engineConfig, 'certPath')) {
    env.DOCKER_CERT_PATH = engineConfig.certPath;
    env.DOCKER_TLS_VERIFY = 1;
    env.DOCKER_BUILDKIT = 1;
    engineConfig.ca = fs.readFileSync(path.join(env.DOCKER_CERT_PATH, 'ca.pem'));
    engineConfig.cert = fs.readFileSync(path.join(env.DOCKER_CERT_PATH, 'cert.pem'));
    engineConfig.key = fs.readFileSync(path.join(env.DOCKER_CERT_PATH, 'key.pem'));
  }
  // Return
  return engineConfig;
};

/**
 * Merge in config file if it exists
 *
 * @since 3.0.0
 * @alias lando.utils.config.loadFiles
 * @param {Array} files - An array of files to try loading
 * @return {Object} An object of config merged from file sources
 */
exports.loadFiles = files => _(files)
  // Filter if file exists
  .filter(fs.existsSync)
  // Start collecting
  .reduce((a, file) => exports.merge(a, yaml.safeLoad(fs.readFileSync(file))), {});

/**
 * Filter process.env by a given prefix
 *
 * @since 3.0.0
 * @alias lando.utils.config.loadEnvs
 * @param {String} prefix - The prefix by which to filter. Should be without the trailing `_` eg `LANDO` not `LANDO_`
 * @return {Object} Object of things with camelCased keys
 */
exports.loadEnvs = prefix => _(process.env)
  // Only muck with prefix_ variables
  .pickBy((value, key) => _.includes(key, prefix))
  // Prep the keys for consumption
  .mapKeys((value, key) => _.camelCase(_.trimStart(key, prefix)))
  // If we have a JSON string as a value, parse that and assign its sub-keys
  .mapValues(exports.tryConvertJson)
  // Resolve the lodash wrapper
  .value();
