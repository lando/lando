'use strict';

// Modules
const _ = require('lodash');
const AsyncEvents = require('./events');
const format = require('util').format;
const hasher = require('object-hash');
const Lando = require('./lando');
const path = require('path');
const Promise = require('./promise');
const utils = require('./utils');

/*
 * Helper to init and then report
 */
const initAndReport = (app, method = 'start') => app.init()
  .then(() => app.metrics.report(method, utils.metricsParse(app)));

/*
 * Helper to load in all app plugins
 */
const loadPlugins = (app, lando) => Promise.resolve(app.plugins.registry)
  // Filter out
  .filter(plugin => _.has(plugin, 'app'))
  // LOADEM!
  .map(plugin => app.plugins.load(plugin, plugin.app, app, lando))
  // Remove any naughty shit
  .map(plugin => _.pick(plugin.data, ['config', 'composeData', 'env', 'labels']))
  // Merge minotaur
  .each(result => _.merge(app, result));

/*
 * @TODO
 */
class App {
  constructor(name, configFile, config, lando = new Lando()) {
    this.name = _.replace(_.toLower(name), ' ', '-');
    this.project = utils.dockerComposify(name);
    this._config = lando.config;
    this._dir = path.join(this._config.userConfRoot, 'compose', this.project);
    this._message = lando.message;
    this._lando = lando;
    this._name = name;
    this.config = config;
    this.configFile = configFile;
    this.ComposeService = lando.factory.get('_compose');
    this.engine = lando.engine;
    this.events = new AsyncEvents(lando.log);
    this.id = hasher(`${this.name}-${this.configFile}`);
    this.log = lando.log;
    this.opts = {};
    this.plugins = lando.plugins;
    this.metrics = lando.metrics;
    this.tasks = lando.tasks.tasks;
  };

  /*
   * @TODO, add compose data to the add
   */
  add(data, front = false) {
    if (front) this.composeData.unshift(data);
    else this.composeData.push(data);
  }

  /*
   * @TODO, should we accept any init opts?
   */
  init() {
    // Set up some additional properties before we get rolling
    this.env = _.cloneDeep(this._config.appEnv);
    this.info = [];
    this.labels = _.cloneDeep(this._config.appLabels);
    this.root = path.dirname(this.configFile);
    this.scanner = this._lando.scanUrls;
    this.services = [];
    this.urls = [];
    // Other properties ?
    // this.info = {};
    // this.mount = '/app';
    // this.webroot = config.webroot || '.';
    // @TODO: Cached metadata, when do we merge that shit in?
    // Get compose data if we have any, otherwise set to []
    const composeFiles = utils.loadComposeFiles(_.get(this, 'config.compose', []), this.root, this.version);
    this.composeData = [new this.ComposeService('compose', ...composeFiles)];

    // Log some things
    this.log.verbose('Initiatilizing app %s from %s', this.name, this.root);
    this.log.debug('App %s uses config %j', this.name, this.config);

    /**
     * Event that allows altering of the app object right after it is
     * instantiated.
     *
     * Note that this is a global event so it is invoked with `lando.events.on`
     * not `app.events.on` See example below:
     *
     * @since 3.0.0
     * @event post_instantiate_app
     * @property {object} config The user's app config.
     */
    return loadPlugins(this, this._lando).then(() => this.events.emit('pre-instantiate-app', this))

    // Actually assemble this thing so its ready for that engine
    .then(() => {
      // Get all the services
      // @TODO: where do we restrict this eg _rebuildOnly?
      this.services = _(this.composeData)
        .flatMap(data => data.data)
        .flatMap(data => _.keys(data.services))
        .uniq()
        .value();

      // Front load our globals
      const globals = utils.toObject(this.services, {
        networks: {default: {}},
        environment: this.env,
        labels: this.labels,
      });
      this.add(new this.ComposeService('globals', {services: globals}), true);
      // Take the big dump of all our compose stuff
      this.compose = utils.dumpComposeData(this.composeData, this._dir);
      // Log
      this.log.info('App %s is ready!', this.name);
      this.log.verbose('App %s has compose files %j', this.project, this.compose);
      this.log.debug('App %s has config', this.name, this.config);
    })

    /**
     * Event that allows altering of the app object right after it has been
     * full instantiated and all its plugins have been loaded.
     *
     * The difference between this event and `post-instantiate-app` is that at
     * this point the event has been handed off from the global `lando.events.on`
     * context to the `app.events.on` context. This means that `post-instantiate-app` will
     * run for ALL apps that need to be instantiated while `app-ready` will run
     * on an app to app basis.
     *
     * @since 3.0.0
     * @event app_ready
     */
     .then(() => this.events.emit('post-instantiate-app', this));
  };

  /**
   * Prints useful information about the app's services.
   *
   * This should return information about the services the app is running,
   * URLs the app can be accessed at, relevant connection information like database
   * credentials and any other information that is added by other plugins.
   *
   * @since 3.0.0
   * @alias lando.app.info
   * @fires pre_info
   * @fires post_info
   * @param {Object} app - A fully instantiated app object
   * @return {Promise} A Promise with an object of information about the app keyed by its services
   */
  inspect() {
    /**
     * Event that allows other things to add useful metadata to the apps services.
     *
     * Its helpful to use this event to add in information for the end user such as
     * how to access their services, where their code exsts or relevant credential info.
     *
     * @since 3.0.0
     * @event pre_info
     */
    return this.init().then(() => this.events.emit('pre-info'))
    // @TODO
    .then(() => {
      // Rebase any current info on top of our defaults
      // @TODO: guessing we can add more here than just service name and urls?
      // @TODO: add container up/down info?
      this.info = _.merge(utils.getInfoDefaults(this), this.info);
      // Get list of containers
      return this.engine.list(this.name)
      // Return running containers
      .filter(container => this.engine.isRunning(container.id))
      // Inspect each and add new URLS
      .map(container => this.engine.scan(container))
      .map(data => utils.getUrls(data))
      .map(data => _.merge(_.find(this.info, {service: data.service}), data));
    })

    /**
     * Event that allows other things to add useful metadata to the apps services.
     *
     * Its helpful to use this event to add in information for the end user such as
     * how to access their services, where their code exsts or relevant credential info.
     *
     * @since 3.0.0
     * @event post_info
     */
    .then(() => this.events.emit('post-info'))

    // Return app info
    .then(() => this.info);
  };

  /*
   * @TODO
   */
  message(...args) {
    const content = format(...args);
    return this._message({
      app: this.name,
      context: 'app',
      message: content,
      type: 'info',
    })
    .then(() => {
      this.log.info(content);
    });
  };

  /**
   * Starts an app.
   *
   * This will start up all services/containers that have been defined for this app.
   *
   * @since 3.0.0
   * @alias lando.app.start
   * @fires pre_start
   * @fires post_start
   * @param {Object} app - A fully instantiated app object
   * @return {Promise} A Promise.
   *
   */
  start() {
    // Log
    this.message('Starting app name %s!', this.name);
    return initAndReport(this)

    /**
     * Event that runs before an app starts up.
     *
     * This is useful if you want to start up any support services before an app
     * stars.
     *
     * @since 3.0.0
     * @event pre_start
     */
    .then(() => this.events.emit('pre-start'))

    // Start core containers
    .then(() => this.engine.start(this))

    /**
     * Event that runs after an app is started.
     *
     * This is useful if you want to perform additional operations after an app
     * starts such as running additional build commands.
     *
     * @since 3.0.0
     * @event post_start
     */
    .then(() => this.events.emit('post-start'))
    // Inspect and scan
    .then(() => this.inspect().then(() => this.scanner(_.flatMap(this.info, 'urls'), {max: 16})))
    .then(urls => this.urls = urls);
  };

  /**
   * Stops an app.
   *
   * This will stop all services/containers that have been defined for this app.
   *
   * @since 3.0.0
   * @alias lando.app.stop
   * @fires pre_stop
   * @fires post_stop
   * @param {Object} app - A fully instantiated app object
   * @return {Promise} A Promise.
   */
  stop() {
    // Stop it!
    this.message('Stopping %s', this.name);
    return initAndReport(this, 'stop')

    /**
     * Event that runs before an app stops.
     *
     * @since 3.0.0
     * @event pre_stop
     */
    .then(() => this.events.emit('pre-stop'))

    // Stop components.
    .then(() => this.engine.stop(this))

    /**
     * Event that runs after an app stop.
     *
     * @since 3.0.0
     * @event post_stop
     */
    .then(() => this.events.emit('post-stop'));
  };

  /**
   * Stops and then starts an app.
   *
   * This just runs `app.stop` and `app.start` in succession.
   *
   * @since 3.0.0
   * @alias lando.app.restart
   * @fires pre_stop
   * @fires post_stop
   * @fires pre_start
   * @fires post_start
   * @param {Object} app - A fully instantiated app object
   * @return {Promise} A Promise.
   */
  restart() {
    // Start it off
    this.message('Restarting %s', this.name);
    // stop/start
    return this.stop().then(() => this.start());
  };

  /**
   * Soft removes the apps services but maintains persistent data like app volumes.
   *
   * This differs from `destroy` in that destroy will hard remove all app services,
   * volumes, networks, etc as well as remove the app from the appRegistry.
   *
   * @since 3.0.0
   * @alias lando.app.uninstall
   * @fires pre_uninstall
   * @fires post_uninstall
   * @param {Boolean} purge - A fully instantiated app object
   * @return {Promise} A Promise.
   */
  uninstall(purge = false) {
    // Cleaning up
    this.message('Uninstalling %s', this.name);
    // Initialize and kick it off
    return this.metrics.report('uninstall', utils.metricsParse(this))

    /**
     * Event that runs before an app is uninstalled.
     *
     * This is useful if you want to add or remove parts of the uninstall process.
     * For example, it might be nice to persist a container whose data you do not
     * want to replace in a rebuild and that cannot persist easily with a volume.
     *
     * @since 3.0.0
     * @event pre_uninstall
     */
    .then(() => this.events.emit('pre-uninstall'))

    // Kill components.
    .then(() => this.engine.destroy(_.merge({}, this, {opts: {purge}})))

    /**
     * Event that runs after an app is uninstalled.
     *
     * This is useful if you want to do some additional cleanup steps after an
     * app is uninstalled such as invalidating any cached data.
     *
     * @since 3.0.0
     * @event post_uninstall
     */
    .then(() => this.events.emit('post-uninstall'));
  };


  /**
   * Hard removes all app services, olumes, networks, etc as well as removes the
   * app from the appRegistry.
   *
   * This differs from `uninstall` in that uninstall will only soft remove all app
   * services, while maintaining things like volumes, networks, etc as well as an
   * entry in the appRegistry.
   *
   * That said this DOES call both `stop` and `uninstall`.
   *
   * @since 3.0.0
   * @alias lando.app.destroy
   * @fires pre_destroy
   * @fires pre_stop
   * @fires post_stop
   * @fires pre_uninstall
   * @fires post_uninstall
   * @fires post_destroy
   * @param {Object} app - A fully instantiated app object
   * @return {Promise} A Promise.
   */
  destroy() {
    // Start it off
    this.message('Destroying %s', this.name);

    /**
     * Event that runs before an app is destroyed.
     *
     * @since 3.0.0
     * @event pre_destroy
     */
    return this.events.emit('pre-destroy')

    // Make sure app is stopped.
    .then(() => this.stop())
    // Uninstall app.
    .then(() => this.uninstall(true))
    // @TODO: Remove from appRegistry
    // .then(() => unregister({name: app.registry})))

    /**
     * Event that runs after an app is destroyed.
     *
     * @since 3.0.0
     * @event post_destroy
     */
    .then(() => this.events.emit('post-destroy'));
  };


  /**
   * Rebuilds an app.
   *
   * This will stop an app, soft remove its services, rebuild those services and
   * then, finally, start the app back up again. This is useful for developers who
   * might want to tweak Dockerfiles or compose yamls.
   *
   * @since 3.0.0
   * @alias lando.app.rebuild
   * @fires pre_stop
   * @fires post_stop
   * @fires pre_uninstall
   * @fires post_uninstall
   * @fires pre_start
   * @fires post_start
   * @param {Object} app - A fully instantiated app object
   * @return {Promise} A Promise.
   */
  rebuild() {
    // Start it off
    this.message('Rebuilding %s', this.name);
    // Stop app.
    return this.stop()

    /**
     * Event that runs before an app is rebuilt.
     *
     * @since 3.0.0
     * @event pre_rebuild
     */
    .then(() => this.events.emit('pre-rebuild'))
    // Uninstall app
    .then(() => this.uninstall())
    // Repull/build components.
    .then(() => this.engine.build(this))

    /**
     * Event that runs after an app is rebuilt.
     *
     * @since 3.0.0
     * @event post_rebuild
     */
    .then(() => this.events.emit('post-rebuild'))
    // Install app.
    .then(() => this.start());
  };
};

module.exports = App;
