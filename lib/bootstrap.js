'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * Helper to build config
 */
exports.buildConfig = options => {
  // Modules
  const hasher = require('object-hash');
  const helpers = require('./config');
  // Start building the config
  let config = helpers.merge(helpers.defaults(), options);
  // If we have configSources let's merge those in as well
  if (!_.isEmpty(config.configSources)) config = helpers.merge(config, helpers.loadFiles(config.configSources));
  // If we have an envPrefix set then lets merge that in as well
  if (_.has(config, 'envPrefix')) config = helpers.merge(config, helpers.loadEnvs(config.envPrefix));
  // Add some final computed properties to the config
  config.instance = hasher(config.userConfRoot);
  // Do some engine config setup
  // Strip all DOCKER_ and COMPOSE_ envvars
  config.env = helpers.stripEnv('DOCKER_');
  config.env = helpers.stripEnv('COMPOSE_');
  // Set up the default engine config if needed
  config.engineConfig = helpers.getEngineConfig(config);
  // Add some docker compose protection on windows
  if (process.platform === 'win32') config.env.COMPOSE_CONVERT_WINDOWS_PATHS = 1;
  // Return the config
  return config;
};

/*
 * Helper for docker compose
 * @TODO: eventually this needs to live somewhere else so we can have a better
 * default engine instantiation
 */
exports.dc = (shell, bin, cmd, {compose, project, opts = {}}) => {
  const dockerCompose = require('./compose');
  const run = dockerCompose[cmd](compose, project, opts);
  return shell.sh([bin].concat(run.cmd), run.opts);
};

/*
 * Helper to setup cache
 */
exports.setupCache = (log, config) => {
  const random = require('uuid/v4');
  const Cache = require('./cache');
  const cache = new Cache({log, cacheDir: path.join(config.userConfRoot, 'cache')});
  if (!cache.get('id')) cache.set('id', random(), {persist: true});
  config.user = cache.get('id');
  config.id = config.user;
  return cache;
};

/*
 * Helper to setup engine
 */
exports.setupEngine = (config, cache, events, log, shell, id) => {
  const Engine = require('./engine');
  const Landerode = require('./docker');
  const LandoDaemon = require('./daemon');
  const docker = new Landerode(config.engineConfig, id);
  const daemon = new LandoDaemon(cache, events, config.dockerBin, log, config.process);
  const compose = (cmd, datum) => exports.dc(shell, config.composeBin, cmd, datum);
  return new Engine(daemon, docker, compose);
};

/*
 * Helper to setup metrics
 */
exports.setupMetrics = (log, config) => {
  const Metrics = require('./metrics');
  return new Metrics({
    log,
    id: config.id,
    endpoints: config.stats,
    data: {
      devMode: false,
      nodeVersion: process.version,
      mode: config.mode || 'unknown',
      os: config.os,
      product: config.product,
      version: config.version,
    },
  });
};
