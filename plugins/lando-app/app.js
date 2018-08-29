'use strict';

// We make this module into a function so we can pass in lando
module.exports = function(lando) {

  // Module
  var _ = lando.node._;
  var AsyncEvents = require('./../../lib/events');
  var fs = lando.node.fs;
  var merger = lando.utils.config.merge;
  var path = require('path');
  var registry = lando.config.appRegistry;
  var Serializer = require('./../../lib/serializer');
  var serializer = new Serializer();
  var util = require('util');
  var utils = require('./lib/utils');

  /*
   * Helper to get registry
   */
  var getRegistry = function() {

    // Promisify
    return lando.Promise.resolve(lando.cache.get(registry) || [])

    // Validate existing registry, we do this in case someone has moved an app
    .filter(function(app) {

      // Get landofile location
      var landofile = path.join(app.dir, lando.config.appConfigFilename);

      // If file doesnt exist then we are done
      if (!fs.existsSync(landofile)) {
        return false;
      }

      // Otherwise make sure the name is accurate
      else {
        return _.get(lando.yaml.load(landofile), 'name') === app.name;
      }

    });

  };

  /**
   * Adds an app to the app registry.
   *
   * @since 3.0.0
   * @alias 'lando.app.register'
   * @param {Object} app - The app to add
   * @param {String} app.name - The name of the app.
   * @param {String} app.dir - The absolute path to this app's lando.yml file.
   * @param {Object} [app.data] - Optional metadata
   * @returns {Promise} A Promise
   * @example
   *
   * // Define an app with some additional and optional metadata
   * var app = {
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
  var register = function(app) {

    // Run through serializer.
    return serializer.enqueue(function() {

      // Get the registry
      getRegistry()

      // Check if app already exists and add if it doesnt
      .then(function(apps) {
        if (!utils.appNameExists(apps, app)) {
          apps.push(app);
          lando.cache.set(registry, apps, {persist: true});
          lando.log.verbose('Added %s to reg with path %s', app.name, app.dir);
        }
      });

    });

  };

  /**
   * Removes an app from the app registry.
   *
   * @since 3.0.0
   * @alias 'lando.app.unregister'
   * @param {Object} app - The app to remove
   * @param {String} app.name - The name of the app.
   * @param {String} app.dir - The absolute path to this app's lando.yml file.
   * @returns {Promise} A Promise
   * @example
   *
   * // Define an app with some additional and optional metadata
   * var app = {
   *   name: 'starfleet.mil',
   *   dir: '/Users/picard/Desktop/lando/starfleet'
   * };
   *
   * // Remove the app
   * return lando.unregister(app);
   *
   */
  var unregister = function(app) {

    // Run through serializer.
    return serializer.enqueue(function() {

      // Get the registry
      getRegistry()

      // Remove the app and set the cache
      .then(function(apps) {
        if (utils.appNameExists(apps, app)) {
          apps = _.filter(apps, function(a) { return app.name !== a.name; });
          lando.cache.set(registry, apps, {persist: true});
          lando.log.verbose('Removed app %s from registry', app.name);
        }
      });

    });

  };

  /*
   * Instantiate helper
   */
  var instantiate = function(name, dir, config) {

    // Log some things
    lando.log.verbose('Getting app %s from %s', name, dir);
    lando.log.debug('App %s uses config', name, config);

    /**
     * Event that allows altering of the config before it is used to
     * instantiate an app object.
     *
     * Note that this is a global event so it is invoked with `lando.events.on`
     * not `app.events.on` See example below:
     *
     * @since 3.0.0
     * @event pre_instantiate_app
     * @property {Object} config The config from the app's .lando.yml
     * @example
     * // Add in some extra default config to our app, set it to run first
     * lando.events.on('pre-instantiate-app', 1, function(config) {
     *
     *   // Add a process env object, this is to inject ENV into the process
     *   // running the app task so we cna use $ENVARS in our docker compose
     *   // files
     *   config.dialedToInfinity = true;
     *
     * });
     */
    return lando.events.emit('pre-instantiate-app', config)

    // Create app.
    .then(function() {

      // Init.
      var app = {};

      // Name.
      app.name = lando.utils.engine.dockerComposify(name);
      // Docker compose files
      app.compose = [];
      // Config
      app.config = config || {};
      // Envvars that get added to every container
      app.env = _.merge(lando.config.containerGlobalEnv, {});
      // Asynchronous event emitter.
      app.events = new AsyncEvents(lando.log);
      // Adds an object to collect helpful info about the app
      app.info = {};
      // Root.
      app.root = dir;
      // Labels that get added to every container
      app.labels = {};
      // Docker compose networks
      app.networks = {};
      // App mount
      app.mount = '/app';
      // The docker compose project
      app.project = app.name;
      // Keep the unparsed name for reconciliation with registry
      app.registry = name;
      // Docker compose services
      app.services = {};
      // App specific tasks
      app.tasks = lando.tasks.tasks || {};
      // Webroot
      app.webRoot = config.webroot || '.';
      // Trigger core messaging emit with app specific message.
      app.message = function() {

        // Parse and format
        var args = _.toArray(arguments);
        var message = util.format.apply(null, args);

        // Message
        return lando.message({
          app: app.name,
          context: 'app',
          message: util.format(message),
          type: 'info'
        })

        // Make sure app status messages make it to global status.
        .then(function() {
          lando.log.info(message);
        });

      };
      // Docker compose version
      app.version = lando.config.composeVersion || '3.2';
      // Docker compose volumes
      app.volumes = {};
      // Set a unique id
      app.id = lando.node.hasher([
        _.get(app, 'name', 'unknown'),
        _.get(app, 'root', 'someplace')
      ]);
      // Mix in any cached metadata
      app = _.merge(app, lando.cache.get('site.meta.' + app.name));

      // Return our app
      return app;

    })

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
     * lando.events.on('post-instantiate-app', 1, function(app) {
     *
     *   // Add in some global container envvars
     *   app.env.LANDO = 'ON';
     *   app.env.LANDO_HOST_OS = lando.config.os.platform;
     *   app.env.LANDO_HOST_UID = lando.config.engineId;
     *   app.env.LANDO_HOST_GID = lando.config.engineGid;
     *
     * });
     */
    .tap(function(app) {
      return lando.events.emit('post-instantiate-app', app);
    })

    // Register app.
    .tap(function(app) {
      return register({name: app.registry, lando: app.name, dir: app.root});
    })

    // Load plugins.
    .tap(function(app) {
      _.forEach(app.config.plugins, function(plugin) {
        return lando.plugins.load(plugin, app.root, lando);
      });
    })

    // Emit app ready event.
    .tap(function(app) {

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
      return app.events.emit('app-ready')

      // Log some results
      .then(function() {
        lando.log.info('App %s is ready!', app.name);
        lando.log.debug('App %s has config', app.name, app.config);
      });
    });

  };

  /**
   * Lists all the Lando apps from the app registry.
   *
   * @since 3.0.0
   * @alias 'lando.app.list'
   * @returns {Promise} Returns a Promise with an array of apps from the registry
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
  var list = function() {

    // Get list of app names.
    return getRegistry()

    // Validate list of apps, look for duplicates.
    .then(function(apps) {

      // Group apps by app names.
      var groups = _.groupBy(apps, function(app) {
        return app.name;
      });

      // Find a set of duplicates.
      var duplicates = _.find(groups, function(group) {
        return group.length !== 1;
      });

      // If a set of duplicates were found throw an error.
      if (duplicates) {
        throw new Error('Duplicate app names exist', duplicates);
      }

      // Pass the apps on to the each
      return apps;

    });

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
   * @alias 'lando.app.get'
   * @fires pre_instantiate_app
   * @fires post_instantiate_app
   * @fires app_ready
   * @param {String} [appName] - The name of the app to get.
   * @returns {Promise} Returns a Pronise with an instantiated app object or nothing.
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
  var get = function(appName) {

    // If we have an appName lets try to match it with a diretory
    return lando.Promise.try(function() {
      if (appName) {
        return list()
        .then(function(apps) {
          return _.find(apps, function(app) {
            return app.name === appName;
          });
        });
      }
    })

    // Try to use a found app first if possible then default to the cwd
    .then(function(app) {
      return _.get(app, 'dir') || path.join(process.cwd());
    })

    // Return an app or warn the user there is no such app
    .then(function(dir) {

      // Split up our dir
      var pieces = dir.split(path.sep);

      // Go through all dir pieces
      return _.map(pieces, function() {

        // Build the dir
        var dir = pieces.join(path.sep);

        // Drop the last path for next iteration
        pieces = _.dropRight(pieces);

        // Return the possible location of lando files
        return path.join(dir, lando.config.appConfigFilename);

      });

    })

    // Return the first directory that has an app
    .then(function(files) {

      // Find the first directory that has a lando.yml
      var configFile = _.find(files, function(file) {
        lando.log.verbose('Checking for app config at %s', file);
        return fs.existsSync(file);
      });

      // If we have a config file let's load up the app
      if (!_.isEmpty(configFile)) {

        // TRy to load the config
        var appConfig = lando.yaml.load(configFile);

        // If we have appConfig then load the app
        if (!_.isEmpty(appConfig)) {
          return instantiate(appConfig.name, path.dirname(configFile), appConfig);
        }

      }

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
   * @alias 'lando.app.isRunning'
   * @param {Object} app - An app object.
   * @param {String} app.name - The name of the app
   * @param {Boolean} checkall - Make sure ALL the apps containers are running
   * @returns {Promise} Returns a Promise with a boolean of whether the app is running or not.
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
  var isRunning = function(app, checkall) {

    // Log
    lando.log.verbose('Checking if %s is running', app.name);

    // Clarify the checkall
    checkall = checkall || false;

    // Check if our engine is up
    return lando.engine.isUp()

    // If we are up check for containers running for an app
    // otherwise return false
    .then(function(isUp) {

      // Engine is up so lets check if the app has running containers
      if (isUp) {

        // Get list of containers
        return lando.engine.list(app.lando)

        // Filter out autostart containers since those will always report TRUE
        .filter(function(container) {
          return lando.engine.scan(container)
          .then(function(data) {
            return data.HostConfig.RestartPolicy.Name !== 'always';
          });
        })

        // Reduce containers to a true false running value
        .reduce(function(isRunning, container) {
          if (checkall) {
            return isRunning && lando.engine.isRunning(container.id);
          }
          else {
            return (isRunning) ? true : lando.engine.isRunning(container.id);
          }
        }, checkall);

      }

      // Engine is down so nothing can be running
      else {
        return false;
      }

    });

  };

  /**
   * Checks to see if the app exists or not.
   *
   * @since 3.0.0
   * @alias 'lando.app.exists'
   * @param {String} appName - The name of the app to get.
   * @returns {Promise} A promise with a boolean of whether the app exists or not.
   * @example
   *
   * // Get an app named myapp and start it
   * return lando.app.exists('myapp')
   *
   * // Theorize if app exists
   * .then(function(exists) {
   *   if (exists) {
   *     console.log('I think, therefore I am.')
   *   }
   * });
   */
  var exists = function(appName) {

    // Get app.
    return get(appName)

    // Return false if we get an app does not exist error.
    .catch(function(err) {
      if (_.contains(err.message, ' does not exist.')) {
        return false;
      }
      else {
        throw err;
      }
    })

    // Return true if app was returned.
    .then(function(app) {
      return !!app;
    });

  };

  /**
   * Prints useful information about the app's services.
   *
   * This should return information about the services the app is running,
   * URLs the app can be accessed at, relevant connection information like database
   * credentials and any other information that is added by other plugins.
   *
   * @since 3.0.0
   * @alias 'lando.app.info'
   * @fires pre_info
   * @fires post_info
   * @param {Object} app - A fully instantiated app object
   * @returns {Promise} A Promise with an object of information about the app keyed by its services
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
  var info = function(app) {

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
    .then(function() {

      // Merge in defualt services
      app.info = merger(app.info, utils.getInfoDefaults(app));

      // Get list of containers
      return lando.engine.list(app.name)

      // Return running containers
      .filter(function(container) {
        return lando.engine.isRunning(container.id);
      })

      // Inspect each and add new URLS
      .each(function(container) {
        return lando.engine.scan(container)
        .then(function(data) {
          var info = app.info[container.service];
          info.urls = merger(info.urls, utils.getUrls(data));
        });
      });

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
    .then(function() {
      return app.events.emit('post-info');
    })

    // Return app info
    .then(function() {
      return app.info;
    });

  };

  /**
   * Soft removes the apps services but maintains persistent data like app volumes.
   *
   * This differs from `destroy` in that destroy will hard remove all app services,
   * volumes, networks, etc as well as remove the app from the appRegistry.
   *
   * @since 3.0.0
   * @alias 'lando.app.uninstall'
   * @fires pre_uninstall
   * @fires post_uninstall
   * @param {Object} app - A fully instantiated app object
   * @returns {Promise} A Promise.
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
  var uninstall = function(app) {

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
    .then(function() {
      return app.events.emit('pre-uninstall');
    })

    // Kill components.
    .then(function() {
      return lando.engine.destroy(app);
    })

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
    .then(function() {
      return app.events.emit('post-uninstall');
    });

  };

  /**
   * Does some helpful cleanup before running an app operation.
   *
   * This command helps clean up apps in an inconsistent state and any orphaned
   * containers they may have.
   *
   * @todo Should this be an internal method? Or can we deprecate at some point?
   * @since 3.0.0
   * @alias 'lando.app.cleanup'
   * @returns {Promise} A Promise.
   * @example
   *
   * // Do the app cleanup
   * return lando.app.cleanup()
   *
   */
  var cleanup = function() {

    // Cleaning up
    lando.message({message: 'Attempting apps cleanup...'});

    // Get all our apps
    return list()

    // Get list of just app names
    .map(function(app) {
      return app.lando;
    })

    // Filter out non-app containers or orphaned containers (eg from deleted apps)
    .then(function(apps) {
      return lando.Promise.filter(lando.engine.list(), function(container) {
        return container.kind === 'app' && !_.includes(apps, container.app);
      });
    })

    // Filter out any other containers that dont match this lando instance
    .filter(function(container) {
      return container.instance === lando.config.instance;
    })

    // Stop containers if needed
    .tap(function(containers) {
      return lando.engine.stop(containers);
    })

    // Kill containers if needed
    .tap(function(containers) {
      return lando.engine.destroy(containers);
    });

  };

  /**
   * Starts an app.
   *
   * This will start up all services/containers that have been defined for this app.
   *
   * @since 3.0.0
   * @alias 'lando.app.start'
   * @fires pre_start
   * @fires post_start
   * @param {Object} app - A fully instantiated app object
   * @returns {Promise} A Promise.
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
  var start = function(app) {

    // Start it up
    app.message('Starting app name %s', app.name);

    // Report to metrics.
    return lando.metrics.report('start', utils.metricsParse(app))

    // Make sure we are in a clean place before we get dirty
    .then(function() {
      return cleanup();
    })

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
    .then(function() {
      return app.events.emit('pre-start');
    })

    // Start core containers
    .then(function() {
      return lando.engine.start(app);
    })

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
     *   var build = [];
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
     *         var compose = {
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
     *    var key = app.name + ':last_build';
     *
     *    // Compute the build hash
     *    var newHash = lando.node.hasher(app.config.services);
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
    .then(function() {
      return app.events.emit('post-start');
    });

  };

  /**
   * Stops an app.
   *
   * This will stop all services/containers that have been defined for this app.
   *
   * @since 3.0.0
   * @alias 'lando.app.stop'
   * @fires pre_stop
   * @fires post_stop
   * @param {Object} app - A fully instantiated app object
   * @returns {Promise} A Promise.
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
  var stop = function(app) {

    // Stop it!
    app.message('Stopping %s', app.name);

    // Report to metrics.
    return lando.metrics.report('stop', utils.metricsParse(app))

    // Make sure we are in a clean place before we get dirty
    .then(function() {
      return cleanup();
    })

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
    .then(function() {
      return app.events.emit('pre-stop');
    })

    // Stop components.
    .then(function() {
      return lando.engine.stop(app);
    })

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
    .then(function() {
      return app.events.emit('post-stop');
    });

  };

  /**
   * Stops and then starts an app.
   *
   * This just runs `app.stop` and `app.start` in succession.
   *
   * @since 3.0.0
   * @alias 'lando.app.restart'
   * @fires pre_stop
   * @fires post_stop
   * @fires pre_start
   * @fires post_start
   * @param {Object} app - A fully instantiated app object
   * @returns {Promise} A Promise.
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
  var restart = function(app) {

    // Start it off
    app.message('Restarting %s', app.name);

    // Stop app.
    return stop(app)

    // Start app.
    .then(function() {
      return start(app);
    });

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
   * @alias 'lando.app.destroy'
   * @fires pre_destroy
   * @fires pre_stop
   * @fires post_stop
   * @fires pre_uninstall
   * @fires post_uninstall
   * @fires post_destroy
   * @param {Object} app - A fully instantiated app object
   * @returns {Promise} A Promise.
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
  var destroy = function(app) {

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
    .then(function() {
      return stop(app);
    })

    // Uninstall app.
    .then(function() {
      return uninstall(_.merge(app, {opts: {purge: true}}));
    })

    // Remove from appRegistry
    .then(function() {
      return unregister({name: app.registry});
    })

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
    .then(function() {
      return app.events.emit('post-destroy');
    });

  };

  /**
   * Rebuilds an app.
   *
   * This will stop an app, soft remove its services, rebuild those services and
   * then, finally, start the app back up again. This is useful for developers who
   * might want to tweak Dockerfiles or compose yamls.
   *
   * @since 3.0.0
   * @alias 'lando.app.rebuild'
   * @fires pre_stop
   * @fires post_stop
   * @fires pre_uninstall
   * @fires post_uninstall
   * @fires pre_start
   * @fires post_start
   * @param {Object} app - A fully instantiated app object
   * @returns {Promise} A Promise.
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
  var rebuild = function(app) {

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
    .then(function() {
      return app.events.emit('pre-rebuild');
    })

    // Uninstall app
    .then(function() {
      return uninstall(app);
    })

    // Repull/build components.
    .then(function() {
      return lando.engine.build(app);
    })

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
    .then(function() {
      return app.events.emit('post-rebuild');
    })

    // Install app.
    .then(function() {
      return start(app);
    });

  };

  // Return the things
  return {
    list: list,
    get: get,
    isRunning: isRunning,
    exists: exists,
    info: info,
    uninstall: uninstall,
    cleanup: cleanup,
    start: start,
    stop: stop,
    register: register,
    restart: restart,
    destroy: destroy,
    rebuild: rebuild,
    unregister: unregister
  };

};
