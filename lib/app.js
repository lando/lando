/**
 * Contains methods and events related to app actions.
 *
 * @since 3.0.0
 * @module app
 * @example
 * // Get the lando object
 * var lando = require('lando')(config);
 *
 * // Start an app
 * return lando.app.start(app)
 *
 * // and then print a success message
 * .then(function() {
 *   console.log('App started!');
 *  });
 */

'use strict';

// Modules
var _ = require('./node')._;
var AsyncEvents = require('./events');
var fs = require('./node').fs;
var config = require('./config');
var daemon = require('./daemon');
var lando = require('./lando')(config);
var path = require('path');
var Promise = require('./promise');
var registry = require('./registry');
var util = require('util');
var yaml = require('./node').yaml;

// Get some scope on our things
var _app = this;

/**
 * Instantiate
 * @fires pre-app-instantiate
 * @fires post-instantiate-app
 * @fires app-ready
 */
var instantiate = function(name, dir, config) {

  // Log some things
  lando.log.verbose('Getting app %s from %s', name, dir);
  lando.log.debug('App %s uses config', name, config);

  /**
   * stuff guys
   *
   * @since 3.0.0
   * @event module:app.event:pre-app-instantiate
   */
  return lando.events.emit('pre-app-instantiate', config)

  // Create app.
  .then(function() {

    // Init.
    var app = {};
    // Self replication
    app._app = _app;
    // Name.
    app.name = config.name || name;
    // Name translated to what docker wants.
    app.dockerName = app.name.replace(/-/g, '');
    // Config
    app.config = config || {};
    // Asynchronous event emitter.
    app.events = new AsyncEvents();
    // Adds an object to collect helpful info about the app
    app.info = {};
    // Root.
    app.root = dir;
    // Root bind.
    app.rootBind = daemon.path2Bind4U(app.root);
    // App specific tasks
    app.tasks = lando.tasks.tasks || {};
    // Webroot
    app.webRoot = config.webroot || '.';
    // Update app status which will fire a status event.
    app.status = function() {
      var args = _.toArray(arguments);
      var msg = util.format.apply(null, args);
      return app.events.emit('status', msg)
      // Make sure app status messages make it to global status.
      .then(function() {
        return lando.log.info(msg);
      });
    };
    // Troll through stdout messages for app status messages.
    app.trollForStatus = function(msg) {
      // Update status when pulling an image.
      var images = msg.match(/Pulling from (.*)/);
      if (images) {
        app.status('Pulling image %s.', images[1]);
      }
    };

    // Return our app
    return app;

  })

  // Emit core post load event.
  .tap(function(app) {

    /**
     * stuff guys
     *
     * @since 3.0.0
     * @event post-instantiate-app
     */
    return lando.events.emit('post-instantiate-app', app);
  })

  // Register app.
  .tap(function(app) {
    return registry.register({name: app.name, dir: app.root});
  })

  // Load plugins.
  .tap(function(app) {
    _.forEach(app.config.plugins, function(plugin) {
      return lando.plugins.load(plugin, app.root);
    });
  })

  // Emit app ready event.
  .tap(function(app) {

  /**
   * stuff guys
   *
   * @since 3.0.0
   * @event app-ready
   */
    return app.events.emit('app-ready')
    .then(function() {

      // Log some results
      lando.log.info('App %s is ready!', app.name);
      lando.log.debug('App %s has config', app.name, app.config);

    });
  });

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
 * @param {Object} [opts] Things
 * @returns {Array} Returns the total.
 * @example
 *
 * // List all the apps
 * return lando.app.list()
 *
 * // Map each app to a summary and print results
 * .map(function(app) {
 *  return appSummary(app)
 *   .then(function(summary) {
 *    console.log(JSON.stringify(summary, null, 2));
 *  });
 * });
 */
exports.list = function(opts) {

  // Set opt defaults
  opts = opts || {useCache: true};

  // Log
  lando.log.verbose('Trying to get list of apps with opts', opts);

  // Get list of app names.
  return registry.getApps(opts)

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
 * Adds three numbers.
 *
 * @since 3.0.0
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
exports.get = function(appName) {

  // If we have an appName lets try to match it with a diretory
  return Promise.try(function() {
    if (appName) {
      return exports.list()
      .then(function(apps) {
        return _.find(apps, function(app) {
          return app.name === appName || app.dockerName === appName;
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
      var appConfig = yaml.safeLoad(fs.readFileSync(configFile));
      return instantiate(appConfig.name, path.dirname(configFile), appConfig);
    }

  });

};

/**
 * Adds three numbers.
 *
 * @since 3.0.0
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
exports.isRunning = function(app) {

  // Log
  lando.log.verbose('Checking if %s is running', app.name);

  // Check if our engine is up
  return lando.engine.isUp()

  // If we are up check for containers running for an app
  // otherwise return false
  .then(function(isUp) {

    // Engine is up so lets check if the app has running containers
    if (isUp) {

      // Get list of containers
      return lando.engine.list(app.name)

      // Filter out autostart containers since those will always report TRUE
      .filter(function(container) {
        return lando.engine.inspect(container)
        .then(function(data) {
          return data.HostConfig.RestartPolicy.Name !== 'always';
        });
      })

      // Reduce containers to a true false running value
      .reduce(function(isRunning, container) {
        return (isRunning) ? true : lando.engine.isRunning(container.id);
      }, false);

    }

    // Engine is down so nothing can be running
    else {
      return false;
    }

  });

};

/**
 * Adds three numbers.
 *
 * @since 3.0.0
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
exports.exists = function(appName) {

  // Get app.
  return _app.get(appName)

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
 * Adds three numbers.
 *
 * @since 3.0.0
 * @fires pre-info
 * @fires post-info
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
exports.info = function(app) {

  /**
   * Snowball event.
   *
   * @event pre-info
   * @property {boolean} isPacked - Indicates whether the snowball is tightly packed.
   */
  return app.events.emit('pre-info')

  // List all the info
  .then(function() {
    if (app) {
      console.log(JSON.stringify(app.info, null, 2));
    }
  })

  /**
   * Snowball event.
   *
   * @event post-info
   * @property {boolean} isPacked - Indicates whether the snowball is tightly packed.
   */
  .then(function() {
    return app.events.emit('post-info');
  });

};

/**
 * Adds three numbers.
 *
 * @since 3.0.0
 * @type {object}
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
exports.uninstall = function(app) {

  // Cleaning up
  app.status('Uninstalling %s', app.name);

  // Report to metrics.
  return lando.metrics.reportAction('uninstall', {app: app})

  // Emit pre event.
  .then(function() {

    /**
     * stuff guys
     *
     * @since 3.0.0
     * @event pre-uninstall
     */
    return app.events.emit('pre-uninstall');
  })

  // Kill components.
  .then(function() {
    return lando.engine.destroy(app);
  })

  // Emit post event.
  .then(function() {

    /**
     * stuff guys
     *
     * @since 3.0.0
     * @event post-uninstall
     */
    return app.events.emit('post-uninstall');
  });

};

/**
 * Adds three numbers.
 *
 * @since 3.0.0
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
exports.cleanup = function(app) {

  // Cleaning up
  app.status('Cleaning up app registry and containers');

  // Get all our containers
  return _app.list({useCache: false})

  // We need to use the dockername
  .map(function(app) {
    return app.name.replace(/-/g, '');
  })

  // Filter out non-app containers
  .then(function(apps) {
    return Promise.filter(lando.engine.list(), function(container) {
      return container.kind === 'app' && !_.includes(apps, container.app);
    });
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
 * Adds three numbers.
 *
 * @since 3.0.0
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
exports.start = function(app) {

  // Start it up
  app.status('Starting %s', app.name);

  // Report to metrics.
  return lando.metrics.reportAction('start', {app: app})

  // Make sure we are in a clean place before we get dirty
  .then(function() {
    return _app.cleanup(app);
  })

  /**
   * stuff guys
   *
   * @since 3.0.0
   * @event pre-start
   */
  .then(function() {
    return app.events.emit('pre-start');
  })

  // Start core containers
  .then(function() {
    return lando.engine.start(app);
  })

  /**
   * stuff guys
   *
   * @since 3.0.0
   * @event post-start
   */
  .then(function() {
    return app.events.emit('post-start');
  });

};

/**
 * Adds three numbers.
 *
 * @since 3.0.0
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
exports.stop = function(app) {

  // Stop it!
  app.status('Stopping %s', app.name);

  // Report to metrics.
  return lando.metrics.reportAction('stop', {app: app})

  // Make sure we are in a clean place before we get dirty
  .then(function() {
    return _app.cleanup(app);
  })

  /**
   * stuff guys
   *
   * @since 3.0.0
   * @event pre-stop
   */
  .then(function() {
    return app.events.emit('pre-stop');
  })

  // Stop components.
  .then(function() {
    return lando.engine.stop(app);
  })

  /**
   * stuff guys
   *
   * @since 3.0.0
   * @event post-start
   */
  .then(function() {
    return app.events.emit('post-stop');
  });

};

/**
 * Adds three numbers.
 *
 * @since 3.0.0
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
exports.restart = function(app) {

  // Start it off
  app.status('Restarting %s', app.name);

  // Stop app.
  return _app.stop(app)

  // Start app.
  .then(function() {
    return _app.start(app);
  });

};

/**
 * Adds three numbers.
 *
 * @since 3.0.0
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
exports.destroy = function(app) {

  // Start it off
  app.status('Destroying %s', app.name);

  /**
   * stuff guys
   *
   * @since 3.0.0
   * @event pre-destroy
   */
  return app.events.emit('pre-destroy')

  // Make sure app is stopped.
  .then(function() {
    return _app.stop(app);
  })

  // Uninstall app.
  .then(function() {
    app.opts = _.merge(app.opts, {purge: true});
    return _app.uninstall(app);
  })

  // Remove from appRegistry
  .then(function() {
    return registry.remove({name: app.name});
  })

  /**
   * stuff guys
   *
   * @since 3.0.0
   * @event post-destroy
   */
  .then(function() {
    return app.events.emit('post-destroy');
  });

};

/**
 * Adds three numbers.
 *
 * @since 3.0.0
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
exports.rebuild = function(app) {

  // Start it off
  app.status('Rebuilding %s', app.name);

  // Stop app.
  return _app.stop(app)

  /**
   * stuff guys
   *
   * @since 3.0.0
   * @event pre-rebuild
   */
  .then(function() {
    return app.events.emit('pre-rebuild');
  })

  // Uninstall app
  .then(function() {
    return _app.uninstall(app);
  })

  // Repull/build components.
  .then(function() {
    return lando.engine.build(app);
  })

  /**
   * stuff guys
   *
   * @since 3.0.0
   * @event post-rebuild
   */
  .then(function() {
    return app.events.emit('post-rebuild');
  })

  // Install app.
  .then(function() {
    return _app.start(app);
  });

};
