'use strict';

// Modules
const _ = require('lodash');
const AsyncEvents = require('./events');
const format = require('util').format;
const Engine = require('./engine');
const Log = require('./logger');
const Metrics = require('./metrics');
const os = require('os');
const path = require('path');
const random = require('uuid/v4');
const utils = require('./utils');
// @TODO: do we REALLLLLY need the below to be in the constructor?
const Yaml = require('./yaml');

class App {
  constructor(
    name,
    dir,
    config = {},
    env = {},
    tasks = {},
    {engine = new Engine(), events = new AsyncEvents(), metrics = new Metrics(), log = new Log(), message = {}} = {},
    outputDir = os.tempDir()
  ) {
    // Name
    // @TODO: unsure of the wisdom/necessity/etc of below
    this.name = _.replace(_.toLower(name), ' ', '-');
    // Core properties
    this.config = config;
    this.composeData = [];
    this.engine = engine;
    this.env = env;
    this.events = new AsyncEvents(log);
    this.log = log;
    this.metrics = metrics;
    this.project = utils.dockerComposify(name);
    this.root = dir;
    this.tasks = tasks;
    this.yaml = new Yaml();
    // "globally-ish things"
    this._events = events;
    this._message = message;
    this._name = name;
    this._dir = outputDir;

    // @TODO: we dont want the below to change to something less fluid like we
    // had before?
    this.id = random();
    // Other properties ?
    // this.info = {};
    // this.labels = {};
    // this.mount = '/app';
    // this.project = app.name;
    // this.registry = name;
    // this.webroot = config.webroot || '.';
    // this.version = version || '3.2';

    // Load plugins.
    // @TODO: below looks wonky
    // @TODO: plugin promise mechanisms need to be broken
    /* .tap(app => {
      _.forEach(app.config.plugins, plugin => {
        return lando.plugins.load(plugin, app.root, lando);
      });
    })
    */

    // @TODO: Cached metadata, when do we merge that shit in?
  };

  /*
   * @TODO
   */
  init() {
    // Bind
    const app = this;

    // Log some things
    app.log.verbose('Initiatilizing app %s from %s', app.name, app.root);
    app.log.debug('App %s uses config %j', app.name, app.config);

    // If we have compose files lets mix them in since this is step one
    // @TODO: do we need an app.add method or some such that all "compose" additions
    // can benefit from
    if (!_.isEmpty(_.get(app, 'config.compose', []))) {
      app.composeData = _(utils.validateFiles(app.config.compose, app.root))
        .map((file, index) => ({id: `compose-${index}`, data: app.yaml.load(file)}))
        .value();
    }

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
     * @example
     * // Add some extra app properties to all apps
     * lando.events.on('pre-instantiate-app', 1, function(app) {
     *
     *   // Add in some global container envconsts
     *   app.env.LANDO = 'ON';
     *   app.env.LANDO_HOST_OS = lando.config.os.platform;
     *   app.env.LANDO_HOST_UID = lando.config.engineId;
     *   app.env.LANDO_HOST_GID = lando.config.engineGid;
     *
     * });
     */
    return app._events.emit('pre-instantiate-app', app)

    // Actually assemble this thing so its ready for that engine
    .tap(() => {
      // @TODO: where does global setting happen eg ENV/labels/etc, presumably
      // get all services and then frontload the compose array?
      // @TODO: How do array things like volumes get merged together?
      // @TODO: need app.services somewhere?
      // @TODO: need app.info/app.urls as well?
      app.compose = _(app.composeData)
        .map(data => _.merge({}, data, {file: path.join(app._dir, 'compose', app.project, `${data.id}.yml`)}))
        // @TODO: where does teh version come from here?
        .map(data => app.yaml.dump(data.file, _.merge({}, data.data, {version: '3.2'})))
        .value();

      // Log
      app.log.verbose('App %s has compose files %j', app.project, app.compose);

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
       * @example
       * // Add logging to report on our apps properties after its full dialed
       * app.events.on('app-ready', function() {
       *
       *   // Log
       *   lando.log.verbose('App %s has global env.', app.name, app.env);
       *   lando.log.verbose('App %s has global labels.', app.name, app.labels);
       *   lando.log.verbose('App %s adds process env.', app.name, app.processEnv);
       *
       * });
       */
      app.log.info('App %s is ready!', app.name);
      app.log.debug('App %s has config', app.name, app.config);
      return app.events.emit('app-ready');
    });
  };

  /*
   * @TODO
   */
  message(...args) {
    const name = this.name;
    const content = format(...args);
    const log = this.log;
    return this._message({
      app: name,
      context: 'app',
      message: content,
      type: 'info',
    })
    .then(() => {
      log.info(content);
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
   * @example
   *
   * // Start the app
   * return lando.app.start(app)
   *
   * // Catch any errors
   * catch(function(err) {
   *   lando.log.error(err);
   * });
   *
   */
  start() {
    // Bind me
    const app = this;
    // Log
    app.message('Starting app name %s!', app.name);
    // Initialize and kick it off
    // @TODO: Register app. here or in init?
    // .tap(app => register({name: app.registry, lando: app.name, dir: app.root}))
    return app.init().then(() => app.metrics.report('start', utils.metricsParse(app)))

    /**
     * Event that runs before an app starts up.
     *
     * This is useful if you want to start up any support services before an app
     * stars.
     *
     * @since 3.0.0
     * @event pre_start
     * @example
     *
     * // Start up a DNS server before our app starts
     * app.events.on('pre-start', function() {
     *   return lando.engine.start(dnsServer);
     * });
     */
    .then(() => app.events.emit('pre-start'))

    // Start core containers
    .then(() => app.engine.start(app))

    /**
     * Event that runs after an app is started.
     *
     * This is useful if you want to perform additional operations after an app
     * starts such as running additional build commands.
     *
     * @since 3.0.0
     * @event post_start
     * @example
     *
     * // Go through each service and run additional build commands as needed
     * app.events.on('post-start', function() {
     *
     *   // Start up a build collector
     *   const build = [];
     *
     *   // Go through each service
     *   _.forEach(app.config.services, function(service, name) {
     *
     *     // If the service has run steps let's loop through and run some commands
     *     if (!_.isEmpty(service.run)) {
     *
     *       // Normalize data for loopage
     *       if (!_.isArray(service.run)) {
     *         service.run = [service.run];
     *       }
     *
     *       // Run each command
     *       _.forEach(service.run, function(cmd) {
     *
     *         // Build out the compose object
     *         const compose = {
     *           id: [service, name, '1'].join('_'),
     *             cmd: cmd,
     *             opts: {
     *             mode: 'attach'
     *           }
     *         };
     *
     *         // Push to the build
     *         build.push(compose);
     *
     *       });
     *
     *     }
     *
     *   });
     *
     *   // Only proceed if build is non-empty
     *   if (!_.isEmpty(build)) {
     *
     *    // Get the last build cache key
     *    const key = app.name + ':last_build';
     *
     *    // Compute the build hash
     *    const newHash = lando.node.hasher(app.config.services);
     *
     *    // If our new hash is different then lets build
     *    if (lando.cache.get(key) !== newHash) {
     *
     *      // Set the new hash
     *      lando.cache.set(key, newHash, {persist:true});
     *
     *      // Run all our post build steps serially
     *      return lando.engine.run(build);
     *
     *    }
     *   }
     * });
     */
    .then(() => app.events.emit('post-start'));
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
   * @example
   *
   * // Stop the app
   * return lando.app.stop(app)
   *
   * // Catch any errors
   * catch(function(err) {
   *   lando.log.error(err);
   * });
   *
   */
  stop() {
    // Bind
    const app = this;
    // Stop it!
    app.message('Stopping %s', app.name);
    // Initialize and kick it off
    return app.init().then(() => app.metrics.report('stop', utils.metricsParse(app)))

    /**
     * Event that runs before an app stops.
     *
     * @since 3.0.0
     * @event pre_stop
     * @example
     *
     * // Stop a DNS server before our app stops.
     * app.events.on('pre-stop', function() {
     *   return lando.engine.stop(dnsServer);
     * });
     */
    .then(() => app.events.emit('pre-stop'))

    // Stop components.
    .then(() => app.engine.stop(app))

    /**
     * Event that runs after an app stop.
     *
     * @since 3.0.0
     * @event post_stop
     * @example
     *
     * // Stop a DNS server after our app stops.
     * app.events.on('post-stop', function() {
     *   return lando.engine.stop(dnsServer);
     * });
     */
    .then(() => app.events.emit('post-stop'));
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
   * @example
   *
   * // Restart the app
   * return lando.app.restart(app)
   *
   * // Catch any errors
   * catch(function(err) {
   *   lando.log.error(err);
   * });
   *
   */
  restart() {
    // Bind
    const app = this;
    // Start it off
    app.message('Restarting %s', app.name);
    // stop/start
    return app.stop().then(() => app.start());
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
   * @example
   *
   * // Uninstall the app
   * return lando.app.uninstall(app)
   *
   * // Catch any errors
   * catch(function(err) {
   *   lando.log.error(err);
   * });
   *
   */
  uninstall(purge = false) {
    // Bind
    const app = this;
    // Cleaning up
    app.message('Uninstalling %s', app.name);
    // Initialize and kick it off
    return app.init().then(() => app.metrics.report('uninstall', utils.metricsParse(app)))

    /**
     * Event that runs before an app is uninstalled.
     *
     * This is useful if you want to add or remove parts of the uninstall process.
     * For example, it might be nice to persist a container whose data you do not
     * want to replace in a rebuild and that cannot persist easily with a volume.
     *
     * @since 3.0.0
     * @event pre_uninstall
     * @example
     *
     * // Do not uninstall the solr service
     * app.events.on('pre-uninstall', function() {
     *   delete app.services.solr;
     * });
     */
    .then(() => app.events.emit('pre-uninstall'))

    // Kill components.
    .then(() => app.engine.destroy(_.merge({}, app, {opts: {purge}})))

    /**
     * Event that runs after an app is uninstalled.
     *
     * This is useful if you want to do some additional cleanup steps after an
     * app is uninstalled such as invalidating any cached data.
     *
     * @since 3.0.0
     * @event post_uninstall
     * @example
     *
     * // Make sure we remove our build cache
     * app.events.on('post-uninstall', function() {
     *   lando.cache.remove(app.name + '.last_build');
     * });
     */
    .then(() => app.events.emit('post-uninstall'));
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
   * @example
   *
   * // Destroy the app
   * return lando.app.destroy(app)
   *
   * // Catch any errors
   * catch(function(err) {
   *   lando.log.error(err);
   * });
   *
   */
  destroy() {
    // Bind
    const app = this;
    // Start it off
    app.message('Destroying %s', app.name);

    /**
     * Event that runs before an app is destroyed.
     *
     * @since 3.0.0
     * @event pre_destroy
     * @example
     *
     * // Make sure the proxy is down before we destroy
     * app.events.on('pre-destroy', function() {
     *   if (fs.existsSync(proxyFile)) {
     *     return lando.engine.stop(getProxy(proxyFile));
     *   }
     * });
     */
    return app.events.emit('pre-destroy')

    // Make sure app is stopped.
    .then(() => app.stop())
    // Uninstall app.
    .then(() => app.uninstall(true))
    // @TODO: Remove from appRegistry
    // .then(() => unregister({name: app.registry})))

    /**
     * Event that runs after an app is destroyed.
     *
     * @since 3.0.0
     * @event post_destroy
     * @example
     *
     * // Make sure the proxy is up brought back up after we destroy
     * app.events.on('post-destroy', function() {
     *   return startProxy();
     * });
     */
    .then(() => app.events.emit('post-destroy'));
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
   * @example
   *
   * // Rebuild the app
   * return lando.app.rebuild(app)
   *
   * // Catch any errors
   * catch(function(err) {
   *   lando.log.error(err);
   * });
   *
   */
  rebuild() {
    // Bind
    const app = this;
    // Start it off
    app.message('Rebuilding %s', app.name);
    // Stop app.
    return app.stop()

    /**
     * Event that runs before an app is rebuilt.
     *
     * @since 3.0.0
     * @event pre_rebuild
     * @example
     *
     * // Do something
     * app.events.on('post-rebuild', function() {
     *   // Do something
     * });
     */
    .then(() => app.events.emit('pre-rebuild'))
    // Uninstall app
    .then(() => app.uninstall())
    // Repull/build components.
    .then(() => app.engine.build(app))

    /**
     * Event that runs after an app is rebuilt.
     *
     * @since 3.0.0
     * @event post_rebuild
     * @example
     *
     * // Do something
     * app.events.on('post-rebuild', function() {
     *   // Do something
     * });
     */
    .then(() => app.events.emit('post-rebuild'))
    // Install app.
    .then(() => app.start());
  };
};

module.exports = App;
