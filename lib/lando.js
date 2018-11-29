'use strict';

// Modules
const _ = require('lodash');
const AsyncEvents = require('./events');
const Cache = require('./cache');
const Cli = require('./cli');
const dockerCompose = require('./compose');
const Engine = require('./engine');
const ErrorHandler = require('./error');
const hasher = require('object-hash');
const LandoDaemon = require('./daemon');
const Landerode = require('./docker');
const Log = require('./logger');
const Metrics = require('./metrics');
const Plugins = require('./plugins');
const path = require('path');
const random = require('uuid/v4');
const Shell = require('./shell');
const UpdateManager = require('./updates');
const Yaml = require('./yaml');

/*
 * Helper for docker compose
 * @TODO: eventually this needs to live somewhere else so we can have a better
 * default engine instantiation
 */
const dc = (shell, bin, cmd, {compose, project, opts = {}}) => {
  const run = dockerCompose[cmd](compose, project, opts);
  return shell.sh([bin].concat(run.cmd), run.opts);
};

/*
 * Helper to setup cache
 */
const setupCache = (log, config) => {
  const cache = new Cache({log, cacheDir: path.join(config.userConfRoot, 'cache')});
  if (!cache.get('id')) cache.set('id', random(), {persist: true});
  config.user = cache.get('id');
  config.id = config.user;
  return cache;
};

/*
 * Helper to setup engine
 */
const setupEngine = (config, cache, events, log, shell) => {
  const docker = new Landerode(config.engineConfig);
  const daemon = new LandoDaemon(cache, events, config.dockerBin, log, config.process);
  const compose = (cmd, datum) => dc(shell, config.composeBin, cmd, datum);
  return new Engine(daemon, docker, compose);
};

/*
 * Helper to setup metrics
 */
const setupMetrics = (log, config) => new Metrics({
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

/*
 * @TODO
 */
module.exports = class Lando {
  constructor(options = {}) {
    // Assemble the config
    // @todo: we need to get this to not load any configSrcs by default
    // Get our config helpers
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

    // Get things we need more than once
    const log = new Log(config);
    const cache = setupCache(log, config);
    const metrics = setupMetrics(log, config);
    const events = new AsyncEvents(log);
    const shell = new Shell(log);

    // Build me a lando worthy of the outer rim
    this.cache = cache;
    this.cli = new Cli();
    this.config = config;
    this.engine = setupEngine(config, cache, events, log, shell);
    this.error = new ErrorHandler(log, metrics),
    this.events = events;
    this.log = log;
    this.message = data => events.emit('message', _.merge({}, {context: 'core', type: 'info'}, data));
    this.metrics = metrics;
    this.node = require('./node');
    this.plugins = new Plugins(log);
    this.Promise = require('./promise');
    this.scanUrls = require('./scan')(log);
    this.shell = shell;
    this.tasks = require('./tasks');
    this.updates = new UpdateManager();
    this.user = require('./user');
    this.utils = require('./config');
    this.yaml = new Yaml(log);
  };

  /**
   * Contains the main bootstrap function, which will:
   *
   *   1. Emit bootstrap events
   *   3. Initialize any plugins
   *
   * You will want to use this after you instantiate `lando` with new Lando(config)`.
   * The intiialization config in the example below is not required but recommended. You can
   * pass in any additional properties to override subsequently set/default values.
   *
   * Check out `./bin/lando.js` in this repository for an example of bootstraping
   * `lando` for usage in a CLI.
   *
   * @since 3.0.0
   * @alias lando.bootstrap
   * @fires pre_bootstrap
   * @fires post_bootstrap
   * @param {Object} [options] Options to initialize the bootstrap
   * @return {Object} An initialized Lando object
   * @example
   * // Get a new Lando
   * const Lando = require('./lib/lando');
   * const lando = new Lando({
   *   logLevelConsole: LOGLEVELCONSOLE,
   *   userConfRoot: USERCONFROOT,
   *   envPrefix: ENVPREFIX,
   *   configSources: configSources,
   *   pluginDirs: [USERCONFROOT],
   *   mode: 'cli'
   * });
   *
   * // Initialize Lando with some options and then init some cli
   * lando.bootstrap().then(lando => cli.init(lando));
   */
  bootstrap() {
    // Self asign
    const lando = this;

    // Log that we've begun
    lando.log.info('Bootstraping...');
    lando.log.silly('It\'s not particularly silly, is it?');

    /**
     * Event that allows other things to augment the lando global config.
     *
     * This is useful so plugins can add additional config settings to the global
     * config.
     *
     * NOTE: This might only be available in core plugins
     *
     * @since 3.0.0
     * @event pre_bootstrap
     * @property {Object} config The global Lando config
     * @example
     * // Add engine settings to the config
     * lando.events.on('pre-bootstrap', config => {
     *   const engineConfig = daemon.getEngineConfig();
     *   config.engineHost = engineConfig.host;
     * });
     */
    return lando.events.emit('pre-bootstrap', lando.config)

    // We should have the fully constructed config at this point
    .then(() => lando.log.debug('Config set: %j', lando.config))

    // Return our plugins so we can init them
    .then(() => lando.config.plugins)

    // Init the plugins
    .map(plugin => lando.plugins.load(plugin, lando.config.pluginDirs, lando))

    /**
     * Event that allows other things to augment the lando object.
     *
     * This is useful so plugins can add additional modules to lando before
     * the bootstrap is completed.
     *
     * @since 3.0.0
     * @event post_bootstrap
     * @property {Object} lando The Lando object
     * @example
     * // Add the services module to lando
     * lando.events.on('post-bootstrap', lando => {
     *   lando.services = require('./services')(lando);
     * });
     */
    .then(() => lando.events.emit('post-bootstrap', lando))

    // Log the doneness
    .then(() => lando.log.info('Bootstrap completed.'))
    .then(() => lando);
  };
};
