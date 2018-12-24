'use strict';

const _ = require('lodash');
const bootstrap = require('./bootstrap');
const fs = require('fs');
const path = require('path');

// Bootstrap levels
const BOOTSTRAP_LEVEL = {
  config: 1,
  tasks: 2,
  engine: 3,
  app: 4,
};

/*
 * Helper to bootstrap plugins
 */
const bootstrapConfig = lando => {
  const Plugins = require('./plugins');
  lando.plugins = new Plugins(lando.log);
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
  // Load in all our tasks
  return lando.Promise.map(lando.config.plugins, plugin => {
    if (fs.existsSync(plugin.tasks)) {
      _.forEach(fs.readdirSync(plugin.tasks), file => {
        lando.tasks.push(require(path.join(plugin.tasks, file))(lando));
        lando.log.debug('Autoloaded task %s', path.basename(file, '.js'));
      });
    }
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
      lando.log.debug('Automoved scripts from %s to %s and setting 755', plugin.scripts, confDir);
    }
  });
};

/*
 * Helper to bootstrap engine
 */
const bootstrapApp = lando => {
  const glob = require('glob');
  const Factory = require('./factory');
  const Yaml = require('./yaml');
  lando.factory = new Factory(),
  lando.yaml = new Yaml(lando.log);
  // Load in all our builders in the correct order
  const builders = _(['compose', 'types', 'services', 'recipes'])
    .flatMap(type => _.map(lando.config.plugins, plugin => plugin[type]))
    .filter(dir => fs.existsSync(dir))
    .flatMap(dir => glob.sync(path.join(dir, '*', 'builder.js')))
    .map(file => lando.factory.add(require(file)).name)
    .value();
  // Log
  lando.log.debug('Autoloaded builders %j', builders);
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

/*
 * @TODO
 */
module.exports = class Lando {
  constructor(options = {}) {
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

  /*
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
  bootstrap(level = 'app') {
    // Log that we've begun
    this.log.info('Bootstraping...');
    this.log.silly('It\'s not particularly silly, is it?');

    // @TODO TEST THE BELOW BIG TIMEZ
    const bootstraps = _.slice(_.keys(BOOTSTRAP_LEVEL), 0, BOOTSTRAP_LEVEL[level]);

    // Loop through our bootstrap levels
    return this.Promise.each(bootstraps, level => {
      this.log.info(`${level} bootstrap beginning...`);
      this._bootstrap = level;
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
       * lando.events.on('pre-bootstrap-LEVEL', config => {
       *   const engineConfig = daemon.getEngineConfig();
       *   config.engineHost = engineConfig.host;
       * });
       */
      return this.events.emit(`pre-bootstrap-${level}`, this)

      // Call the things that should happen at each level
      .then(() => bootstrapRouter(level, this))

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
      .then(() => this.events.emit(`post-bootstrap-${level}`, this))
      // Log the doneness
      .then(() => this.log.info(`${level} bootstrap completed.`));
    })
    .then(() => this.log.info(`Bootstrap completed.`))
    .then(() => this);
  };

  /**
   * Gets a fully instantiated app object.
   *
   * If you do not pass in an `appName` Lando will attempt to find an app in your
   * current working directory.
   *
   * Lando will also scan parent directories if no app is found.
   *
   * @since 3.0.0
   * @alias lando.app.get
   * @fires pre_instantiate_app
   * @fires post_instantiate_app
   * @fires app_ready
   * @param {String} [file] - The name of the app to get.
   * @param {Boolean} [warn] - The name of the app to get.
   * @return {Promise} Returns a Pronise with an instantiated app object or nothing.
   * @example
   *
   * // Get an app named myapp and start it
   * return lando.app.get('myapp')
   *
   * // Start the app
   * .then(function(app) {
   *   lando.app.start(app);
   * });
   */
  getApp(file, warn = true) {
    const utils = require('./utils');
    // Recursively traverse upwards until we find our first file
    const files = utils.traverseUp(file);
    // Log the scan
    this.log.verbose('Looking for app config in %j', files);
    // Try to find a winner from the field of candidates
    const configFile = _.find(files, file => fs.existsSync(file));
    // Return us if we find nothing
    if (!configFile) {
      if (warn) {
        this.log.warn('Could not find app in this dir or a reasonable amount of directories above it!');
      }
      return;
    }
    // Load the config and augment so we can get an App
    // @TODO: mix in cached app metadata when the time is right
    // app = _.merge(app, this.cache.get('site.meta.' + app.name));
    const config = this.yaml.load(configFile);
    this.log.info('App config file found at %s', configFile);
    this.log.debug('App config for %s is %j', config.name, config);
    // Return us some app!
    const App = require('./app');
    return new App(config.name, _.merge({}, config, {file: configFile}), this);
  };

  /*
   * @TODO
   */
  message(data) {
    return this.events.emit('message', _.merge({}, {context: 'core', type: 'info'}, data));
  };
};
