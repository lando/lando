'use strict';

// We make this module into a function so we can pass in lando
module.exports = lando => {
  // Module
  const _ = lando.node._;
  const fs = lando.node.fs;
  const merger = lando.utils.config.merge;
  const path = require('path');
  const registry = lando.config.appRegistry;
  const Serializer = require('./../../lib/serializer');
  const serializer = new Serializer();
  const utils = require('./lib/utils');

  /*
   * Helper to get registry
   */
  const getRegistry = function() {
    // Promisify
    return lando.Promise.resolve(lando.cache.get(registry) || [])
    // Validate existing registry, we do this in case someone has moved an app
    .filter(app => {
      // Get landofile location
      const landofile = path.join(app.dir, lando.config.appConfigFilename);

      // If file doesnt exist then we are done
      if (!fs.existsSync(landofile)) {
        return false;
      } else {
        return _.get(lando.yaml.load(landofile), 'name') === app.name;
      }
    });
  };

  /**
   * Adds an app to the app registry.
   *
   * @since 3.0.0
   * @alias lando.app.register
   * @param {Object} app - The app to add
   * @param {String} app.name - The name of the app.
   * @param {String} app.dir - The absolute path to this app's lando.yml file.
   * @param {Object} [app.data] - Optional metadata
   * @return {Promise} A Promise
   * @example
   *
   * // Define an app with some additional and optional metadata
   * const app = {
   *   name: 'starfleet.mil',
   *   dir: '/Users/picard/Desktop/lando/starfleet',
   *   data: {
   *     warpfactor: 9
   *   }
   * };
   *
   * // Register the app
   * return lando.registry.register(app);
   *
   */
  const register = app => serializer.enqueue(() => {
    // Get the registry
    getRegistry()
    // Check if app already exists and add if it doesnt
    .then(apps => {
      if (!utils.appNameExists(apps, app)) {
        apps.push(app);
        lando.cache.set(registry, apps, {persist: true});
        lando.log.verbose('Added %s to reg with path %s', app.name, app.dir);
      }
    });
  });

  /**
   * Removes an app from the app registry.
   *
   * @since 3.0.0
   * @alias lando.app.unregister
   * @param {Object} app - The app to remove
   * @param {String} app.name - The name of the app.
   * @param {String} app.dir - The absolute path to this app's lando.yml file.
   * @return {Promise} A Promise
   * @example
   *
   * // Define an app with some additional and optional metadata
   * const app = {
   *   name: 'starfleet.mil',
   *   dir: '/Users/picard/Desktop/lando/starfleet'
   * };
   *
   * // Remove the app
   * return lando.unregister(app);
   *
   */
  const unregister = app => serializer.enqueue(() => {
    // Get the registry
    getRegistry()
    // Remove the app and set the cache
    .then(apps => {
      if (utils.appNameExists(apps, app)) {
        apps = _.filter(apps, a => app.name !== a.name);
        lando.cache.set(registry, apps, {persist: true});
        lando.log.verbose('Removed app %s from registry', app.name);
      }
    });
  });

  /**
   * Lists all the Lando apps from the app registry.
   *
   * @since 3.0.0
   * @alias lando.app.list
   * @return {Promise} Returns a Promise with an array of apps from the registry
   * @example
   *
   * // List all the apps
   * return lando.app.list()
   *
   * // Pretty print each app to the console.
   * .map(function(app) {
   *   console.log(JSON.stringify(app, null, 2));
   * });
   */
  const list = () => {
    // Get list of app names.
    return getRegistry()
    // Validate list of apps, look for duplicates.
    .then(apps => {
      // Group apps by app names.
      const groups = _.groupBy(apps, app => app.name);
      // Find a set of duplicates.
      const duplicates = _.find(groups, group => group.length !== 1);
      // If a set of duplicates were found throw an error.
      if (duplicates) {
        throw new Error('Duplicate app names exist', duplicates);
      }
      // Pass the apps on to the each
      return apps;
    });
  };

  /**
   * Determines whether an app is running or not. By defualt it only requires
   * that a single service for that be running to return true but see opts below.
   *
   * You can pass in an entire app object here but it really just needs an object
   * with the app name eg {name: 'myapp'}
   *
   * @since 3.0.0
   * @alias lando.app.isRunning
   * @param {Object} app - An app object.
   * @param {String} app.name - The name of the app
   * @param {Boolean} checkall - Make sure ALL the apps containers are running
   * @return {Promise} Returns a Promise with a boolean of whether the app is running or not.
   * @example
   *
   * // Let's check to see if the app has been started
   * return lando.app.isRunning(app)
   *
   * // Start the app if its not running already
   * .then(function(isRunning) {
   *   if (!isRunning) {
   *     return lando.app.start(app);
   *   }
   * });
   */
  const isRunning = (app, checkall = false) => {
    // Log
    lando.log.verbose('Checking if %s is running', app.name);
    // Get list of container
    return lando.engine.list(app.lando)
    // Filter out autostart containers since those will always report TRUE
    .filter(container => lando.engine.scan(container).then(data => data.HostConfig.RestartPolicy.Name !== 'always'))
    // Reduce containers to a true false running value
    .reduce((isRunning, container) => {
      if (checkall) {
        return isRunning && lando.engine.isRunning(container.id);
      } else {
        return (isRunning) ? true : lando.engine.isRunning(container.id);
      }
    }, checkall);
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
   * @example
   *
   * // Return the app info
   * return lando.app.info(app)
   *
   * // And print out any services with urls
   * .each(function(service) {
   *   if (_.has(service, 'urls')) {
   *     console.log(service.urls);
   *   }
   * });
   */
  const info = app => {
    /**
     * Event that allows other things to add useful metadata to the apps services.
     *
     * Its helpful to use this event to add in information for the end user such as
     * how to access their services, where their code exsts or relevant credential info.
     *
     * @since 3.0.0
     * @event pre_info
     * @example
     *
     * // Add urls to the app
     * app.events.on('pre-info', function() {
     *   return getUrls(app);
     * });
     */
    return app.events.emit('pre-info')
    // Merge in defaults
    .then(() => {
      // Merge in defualt services
      app.info = merger(app.info, utils.getInfoDefaults(app));
      // Get list of containers
      return lando.engine.list(app.name)
      // Return running containers
      .filter(container => lando.engine.isRunning(container.id))
      // Inspect each and add new URLS
      .each(container => lando.engine.scan(container).then(data => {
        const info = app.info[container.service];
        info.urls = merger(info.urls, utils.getUrls(data));
      }));
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
    .then(() => app.events.emit('post-info'))

    // Return app info
    .then(() => app.info);
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
   * @param {Object} app - A fully instantiated app object
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
  const uninstall = app => {
    // Cleaning up
    app.message('Uninstalling %s', app.name);

    // Report to metrics.
    return lando.metrics.report('uninstall', utils.metricsParse(app))

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
    .then(() => lando.engine.destroy(app))

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
  const destroy = app => {
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
    .then(() => stop(app))
    // Uninstall app.
    .then(() => uninstall(_.merge(app, {opts: {purge: true}}))
    // Remove from appRegistry
    .then(() => unregister({name: app.registry})))
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
  const rebuild = app => {
    // Start it off
    app.message('Rebuilding %s', app.name);
    // Stop app.
    return stop(app)
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
    .then(() => uninstall(app))
    // Repull/build components.
    .then(() => lando.engine.build(app))
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
    .then(() => start(app));
  };

  // Return the things
  return {
    list: list,
    get: get,
    isRunning: isRunning,
    exists: exists,
    info: info,
    uninstall: uninstall,
    register: register,
    restart: restart,
    destroy: destroy,
    rebuild: rebuild,
    unregister: unregister,
  };
};
