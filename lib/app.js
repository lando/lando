/**
 * Module for apps.
 *
 * @name app
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

/*
 * Instantiate
 */
var instantiate = function(name, dir, config) {

  // Log some things
  lando.log.verbose('Getting app %s from %s', name, dir);
  lando.log.debug('App %s uses config', name, config);

  // Emit pre app create event.
  return lando.events.emit('pre-app-instantiate', config)

  // Create app.
  .then(function() {

    // Init.
    var app = {};
    // Self replication
    app._app = _app;
    // Name.
    app.name = config.name || name;
    // Config
    app.config = config || {};
    // Asynchronous event emitter.
    app.events = new AsyncEvents();
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
    return app.events.emit('app-ready')
    .then(function() {

      // Log some results
      lando.log.info('App %s is ready!', app.name);
      lando.log.debug('App %s has config', app.name, app.config);

    });
  });

};

/**
 * Lists all the users apps known to Lando.
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
 * Get an app object
 */
exports.get = function(appName) {

  // If we have an appName lets try to match it with a diretory
  return Promise.try(function() {
    if (appName) {
      return exports.list()
      .then(function(apps) {
        return _.find(apps, function(app) {
          return app.name === appName || app.name === appName.replace(/-/g, '');
        });
      });
    }
  })

  // Try to use a found app first if possible then default the cwd
  .then(function(app) {
    return _.get(app, 'dir') || path.join(process.cwd());
  })

  // Return an app or warn the user there is no such app
  .then(function(dir) {

    // Log
    lando.log.verbose('Checking for app config at %s', dir);

    // Get app config file
    var configFile = path.join(dir, config.appConfigFilename);

    // Return app
    if (fs.existsSync(configFile)) {
      var appConfig = yaml.safeLoad(fs.readFileSync(configFile));
      return instantiate(appConfig.name, dir, appConfig);
    }

    // Warn user there is no app to load
    else {
      lando.log.warn('Could not find app %s', appName || 'in this directory');
    }

  });

};

/**
 * Returns whether an app is running or not
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
 * Returns true if app with given app name exists.
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
 * Uninstalls an app's components
 */
exports.uninstall = function(app) {

  // Cleaning up
  app.status('Uninstalling %s', app.name);

  // Emit pre event.
  return app.events.emit('pre-uninstall')

  // Kill components.
  .then(function() {
    return lando.engine.destroy(app);
  })

  // Emit post event.
  .then(function() {
    return app.events.emit('post-uninstall');
  });

};

/**
 * Attempts to clean up corrupted apps. internal will compare the appRegistry
 * with kbox.list to determine apps that may have orphaned containers. If
 * those apps do have orphaned containers then we remove those containers
 * and finally the corrupted app from the appRegisty.
 */
exports.cleanup = function(app) {

  // Cleaning up
  app.status('Cleaning up app registry and containers');

  // Get all our containers
  return _app.list({useCache: false})

  // We need to swap out hypens for nothings
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
 * Starts an app's components.
 */
exports.start = function(app) {

  // Start it up
  app.status('Starting %s', app.name);

  // Make sure we are in a clean place before we get dirty
  return _app.cleanup(app)

  // Emit pre start event.
  .then(function() {
    return app.events.emit('pre-start');
  })

  // Start core containers
  .then(function() {
    return lando.engine.start(app);
  })

  // Emit post start event.
  .then(function() {
    return app.events.emit('post-start');
  });

};

/**
 * Stops an app's components
 */
exports.stop = function(app) {

  // Stop it!
  app.status('Stopping %s', app.name);

  // Make sure we are in a clean place before we get dirty
  return _app.cleanup(app)

  // Emit pre event.
  .then(function() {
    return app.events.emit('pre-stop');
  })

  // Stop components.
  .then(function() {
    return lando.engine.stop(app);
  })

  // Emit post event.
  .then(function() {
    return app.events.emit('post-stop');
  });

};

/**
 * Stops and then starts an app's components.
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
 * Uninstalls an app's components including the data container, and removes
 * the app's code directory.
 */
exports.destroy = function(app) {

  // Start it off
  app.status('Destroying %s', app.name);

  // Emit pre event.
  return app.events.emit('pre-destroy')

  // Make sure app is stopped.
  .then(function() {
    return _app.stop(app);
  })

  // Uninstall app.
  .then(function() {
    return _app.uninstall(app);
  })

  // Remove from appRegistry
  .then(function() {
    return registry.remove({name: app.name});
  })

  // Emit post event.
  .then(function() {
    return app.events.emit('post-destroy');
  });

};

/**
 * Rebuilds an apps containers. this will stop an app's containers, remove all
 * of them except the data container, pull down the latest versions of the
 * containers as specified in the app's .lando.yml. You will need to run
 * `kbox start` when done to restart your app.
 */
exports.rebuild = function(app) {

  // Start it off
  app.status('Rebuilding %s', app.name);

  // Stop app.
  return _app.stop(app)

  // Pre rebuild eveny
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

  // Emit post event.
  .then(function() {
    return app.events.emit('post-rebuild');
  })

  // Install app.
  .then(function() {
    return _app.start(app);
  });

};
