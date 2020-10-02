'use strict';

const _ = require('lodash');
const bootstrap = require('./bootstrap');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

// Bootstrap levels
const BOOTSTRAP_LEVELS = {
  config: 1,
  tasks: 2,
  engine: 3,
  app: 4,
};

// Default version information
const DEFAULT_VERSIONS = {networking: 1};

// Helper to get init config
const getInitConfig = dirs => _(dirs)
  .filter(dir => fs.existsSync(dir))
  .flatMap(dir => glob.sync(path.join(dir, '*', 'init.js')))
  .map(file => require(file))
  .value();

// Helper to get init source config
const getInitSourceConfig = dirs => _(dirs)
  .filter(dir => fs.existsSync(dir))
  .flatMap(dir => glob.sync(path.join(dir, '*.js')))
  .map(file => require(file))
  .flatMap(source => source.sources)
  .value();

/*
 * Helper to bootstrap plugins
 */
const bootstrapConfig = lando => {
  const Plugins = require('./plugins');
  lando.plugins = new Plugins(lando.log);
  lando.versions = _.merge({}, DEFAULT_VERSIONS, lando.cache.get('versions'));
  // Disable the alliance plugin unless certain conditions are met
  if (lando.config.packaged || !lando.config.alliance) lando.config.disablePlugins.push('lando-alliance');
  // Load in experimental features
  if (lando.config.experimental) {
    const experimentalPluginPath = path.join(__dirname, '..', 'experimental');
    lando.config.pluginDirs.push({path: experimentalPluginPath, subdir: '.'});
  }
  // Find the plugins
  return lando.plugins.find(lando.config.pluginDirs, lando.config)
  // Init the plugins
  .map(plugin => lando.plugins.load(plugin, plugin.path, lando))
  .map(plugin => {
    // Merge in config
    if (_.has(plugin, 'data.config')) lando.config = _.merge(plugin.data.config, lando.config);
    // Add plugins to config
    // @NOTE: we remove plugin.data here because circular ref error and because presumably that
    // data is now expessed directly in the lando object somewhere
    lando.config.plugins.push(_.omit(plugin, 'data'));
  });
};

/*
 * Helper to bootstrap tasks
 */
const bootstrapTasks = lando => {
  // Load in config from init and source plugins
  const inits = getInitConfig(_.map(lando.config.plugins, 'recipes'));
  const sources = getInitSourceConfig(_.map(lando.config.plugins, 'sources'));
  const initSources = _(inits).filter(init => _.has(init, 'sources')).flatMap(init => init.sources).value();
  // Sort into useful things and add to config
  lando.config.sources = _.sortBy(sources.concat(initSources), 'label');
  lando.config.recipes = _.sortBy(_.map(inits, init => init.name), 'name');
  lando.config.inits = inits;

  // Load in all our tasks
  return lando.Promise.resolve(lando.config.plugins)
    // Make sure the tasks dir exists
    .filter(plugin => fs.existsSync(plugin.tasks))
    // Get a list off full js files that exist in that dir
    .map(plugin => _(fs.readdirSync(plugin.tasks))
      .map(file => path.join(plugin.tasks, file))
      .filter(path => _.endsWith(path, '.js'))
      .value()
    )
    // Loadem and loggem
    .then(tasks => _.flatten(tasks))
    .each(task => {
      lando.tasks.push(require(task)(lando));
      lando.log.debug('autoloaded task %s', path.basename(task, '.js'));
    })
    // Reset the task cache
    .then(() => {
      lando.cache.set('_.tasks.cache', JSON.stringify(lando.tasks), {persist: true});
    });
};

/*
 * Helper to bootstrap engine
 */
const bootstrapEngine = lando => {
  const Shell = require('./shell');
  lando.shell = new Shell(lando.log);
  lando.scanUrls = require('./scan')(lando.log);
  lando.engine = bootstrap.setupEngine(
    lando.config,
    lando.cache,
    lando.events,
    lando.log,
    lando.shell,
    lando.config.instance
  );
  lando.utils = _.merge({}, require('./utils'), require('./config'));
  // Auto move and make executable any scripts
  return lando.Promise.map(lando.config.plugins, plugin => {
    if (fs.existsSync(plugin.scripts)) {
      const confDir = path.join(lando.config.userConfRoot, 'scripts');
      const dest = lando.utils.moveConfig(plugin.scripts, confDir);
      lando.utils.makeExecutable(fs.readdirSync(dest), dest);
      lando.log.debug('automoved scripts from %s to %s and set to mode 755', plugin.scripts, confDir);
    }
  });
};

/*
 * Helper to bootstrap app stuffs
 */
const bootstrapApp = lando => {
  const Factory = require('./factory');
  const Yaml = require('./yaml');
  lando.factory = new Factory();
  lando.yaml = new Yaml(lando.log);
  // Load in all our builders in the correct order
  const builders = _(['compose', 'types', 'services', 'recipes'])
    .flatMap(type => _.map(lando.config.plugins, plugin => plugin[type]))
    .filter(dir => fs.existsSync(dir))
    .flatMap(dir => glob.sync(path.join(dir, '*', 'builder.js')))
    .map(file => lando.factory.add(require(file)).name)
    .value();
  // Log
  _.forEach(builders, builder => lando.log.debug('autoloaded builder %s', builder));
};

/*
 * Helper to route bootstrap things
 */
const bootstrapRouter = (level, lando) => {
  switch (level) {
    case 'config': return bootstrapConfig(lando);
    case 'tasks': return bootstrapTasks(lando);
    case 'engine': return bootstrapEngine(lando);
    case 'app': return bootstrapApp(lando);
    default: return true;
  }
};

/**
 * The class to instantiate a new Lando
 *
 * Generally you will not need to do this unless you are using Lando to build your own
 * interface.
 *
 * Check out `./bin/lando.js` in this repository for an example of how we instantiate
 * `lando` for usage in a CLI.
 *
 * @since 3.0.0
 * @name Lando
 * @param {Object} [options] Options to initialize a Lando object with
 * @return {Lando} An initialized Lando instance
 * @example
 * // Get a new lando instance
 * const Lando = require('lando');
 * const lando = new Lando({
 *   logLevelConsole: LOGLEVELCONSOLE,
 *   userConfRoot: USERCONFROOT,
 *   envPrefix: ENVPREFIX,
 *   configSources: configSources,
 *   pluginDirs: [USERCONFROOT],
 *   mode: 'cli'
 * });
 */
module.exports = class Lando {
  constructor(options = {}) {
    this.BOOTSTRAP_LEVELS = BOOTSTRAP_LEVELS;
    this.config = bootstrap.buildConfig(options);
    this.Promise = require('./promise');
    this.tasks = [];
    const AsyncEvents = require('./events');
    const Cli = require('./cli');
    const Log = require('./logger');
    const ErrorHandler = require('./error');
    const UpdateManager = require('./updates');
    this.cache = bootstrap.setupCache(this.log, this.config);
    this.cli = new Cli();
    this.log = new Log(this.config);
    this.metrics = bootstrap.setupMetrics(this.log, this.config);
    this.error = new ErrorHandler(this.log, this.metrics),
    this.events = new AsyncEvents(this.log);
    this.updates = new UpdateManager();
    this.user = require('./user');
  };

  /**
   * Bootstraps Lando, this should
   *
   *  1. Emit bootstrap events
   *  2. Auto detect and then load any plugins
   *  3. Augment the lando object with additional methods
   *
   * You will want to use this after you instantiate `lando` via `new Lando(config)`. There
   * are four available bootstrap levels and each provides different things. The run in
   * the order presented.
   *
   *      config     Autodetects and loads any plugins and merges their returns into
   *                 the global config
   *
   *      tasks      Autodetects and loads in any tasks along with recipe inits and
   *                 init sources
   *
   *      engine     Autodetects and moves any plugin scripts, adds `engine`, `shell`,
   *                 `scanUrls` and `utils` to the lando instance
   *
   *      app        Autodetects and loads in any `services` and `recipes` and also adds `yaml
   *                 and `factory` to the lando instance.
   *
   * Check out `./bin/lando.js` in this repository for an example of bootstraping
   * `lando` for usage in a CLI.
   *
   * @since 3.0.0
   * @alias lando.bootstrap
   * @fires pre_bootstrap_config
   * @fires pre_bootstrap_tasks
   * @fires pre_bootstrap_engine
   * @fires pre_bootstrap_app
   * @fires post_bootstrap_config
   * @fires post_bootstrap_tasks
   * @fires post_bootstrap_engine
   * @fires post_bootstrap_app
   * @param {String} [level=app] Level with which to bootstrap Lando
   * @return {Promise} A Promise
   * @example
   * // Bootstrap lando at default level and then exit
   * lando.bootstrap().then(() => process.exit(0))l
   */
  bootstrap(level = 'app') {
    // Log that we've begun
    this.log.verbose('starting bootstrap at level %s...', level);
    this.log.silly('it\'s not particularly silly, is it?');

    // @TODO TEST THE BELOW BIG TIMEZ
    const bootstraps = _.slice(_.keys(BOOTSTRAP_LEVELS), 0, BOOTSTRAP_LEVELS[level]);

    // Loop through our bootstrap levels
    return this.Promise.each(bootstraps, level => {
      this.log.verbose('%s bootstrap beginning...', level);
      this._bootstrap = level;

      /**
       * Event that runs before we bootstrap config.
       *
       * @since 3.0.0
       * @alias lando.events:pre-bootstrap-config
       * @event pre_bootstrap_config
       * @property {Lando} lando The lando object
       * @example
       * lando.events.on('pre-bootstrap-config', lando => {
       *   // My codes
       * });
       */
      /**
       * Event that runs before we bootstrap tasks.
       *
       * @since 3.0.0
       * @alias lando.events:pre-bootstrap-tasks
       * @event pre_bootstrap_tasks
       * @property {Lando} lando The lando object
       * @example
       * lando.events.on('pre-bootstrap-tasks', lando => {
       *   // My codes
       * });
       */
      /**
       * Event that runs before we bootstrap the engine.
       *
       * @since 3.0.0
       * @alias lando.events:pre-bootstrap-engine
       * @event pre_bootstrap_engine
       * @property {Lando} lando The lando object
       * @example
       * lando.events.on('pre-bootstrap-engine', lando => {
       *   // My codes
       * });
       */
      /**
       * Event that runs before we bootstrap the app.
       *
       * @since 3.0.0
       * @alias lando.events:pre-bootstrap-app
       * @event pre_bootstrap_app
       * @property {Lando} lando The lando object
       * @example
       * lando.events.on('pre-bootstrap-app', lando => {
       *   // My codes
       * });
       */
      return this.events.emit(`pre-bootstrap-${level}`, this)

      // Call the things that should happen at each level
      .then(() => bootstrapRouter(level, this))

      /**
       * Event that runs after we bootstrap config
       *
       * @since 3.0.0
       * @alias lando.events:post-bootstrap-config
       * @event post_bootstrap_config
       * @property {Lando} lando The Lando object
       * @example
       * lando.events.on('post-bootstrap-config', lando => {
       *   // My codes
       * });
       */
      /**
       * Event that runs after we bootstrap tasks
       *
       * @since 3.0.0
       * @alias lando.events:post-bootstrap-tasks
       * @event post_bootstrap_tasks
       * @property {Lando} lando The Lando object
       * @example
       * lando.events.on('post-bootstrap-tasks', lando => {
       *   // My codes
       * });
       */
      /**
       * Event that runs after we bootstrap the engine
       *
       * @since 3.0.0
       * @alias lando.events:post-bootstrap-engine
       * @event post_bootstrap_engine
       * @property {Lando} lando The Lando object
       * @example
       * lando.events.on('post-bootstrap-engine', lando => {
       *   // My codes
       * });
       */
      /**
       * Event that runs after we bootstrap the app
       *
       * @since 3.0.0
       * @alias lando.events:post-bootstrap-app
       * @event post_bootstrap_app
       * @property {Lando} lando The Lando object
       * @example
       * lando.events.on('post-bootstrap-app', lando => {
       *   // My codes
       * });
       */
      .then(() => this.events.emit(`post-bootstrap-${level}`, this))
      // Log the doneness
      .then(() => this.log.verbose('%s bootstrap completed.', level));
    })
    .then(() => this.log.verbose('bootstrap completed.'))
    .then(() => this.events.emit(`post-bootstrap`, this))
    .then(() => this);
  };

  /**
   * Gets a fully instantiated App instance.
   *
   * Lando will also scan parent directories if no app is found in `startFrom`
   *
   * @since 3.0.0
   * @alias lando.getApp
   * @param {String} [startFrom=process.cwd()] The directory to start looking for an app
   * @param {Boolean} [warn=true] Show a warning if we can't find an app
   * @return {App} Returns an instantiated App instandce.
   * @example
   * const app = lando.getApp('/path/to/my/app')
   */
  getApp(startFrom = process.cwd(), warn = true) {
    const merger = require('./config').merge;
    const utils = require('./bootstrap');
    const Yaml = require('./yaml');
    const yaml = new Yaml(this.log);
    // Grab lando files for this app
    const fileNames = _.flatten([this.config.preLandoFiles, [this.config.landoFile], this.config.postLandoFiles]);
    const landoFiles = utils.getLandoFiles(fileNames, startFrom);
    // Return warning if we find nothing
    if (_.isEmpty(landoFiles)) {
      if (warn) {
        this.log.warn('could not find app in this dir or a reasonable amount of directories above it!');
      }
      return;
    }

    // Load the config and augment so we can get an App
    const config = merger({}, ..._.map(landoFiles, file => yaml.load(file)));
    this.log.info('loading app %s from config files', config.name, landoFiles);
    this.log.debug('app %s has config', config.name, config);
    // Return us some app!
    const App = require('./app');
    return new App(config.name, _.merge({}, config, {files: landoFiles}), this);
  };
};
