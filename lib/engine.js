/**
 * Contains methods and events related to running docker things.
 *
 * @since 3.0.0
 * @fires pre-bootstrap
 * @module engine
 * @example
 *
 * // Start an app
 * return lando.app.start(app);
 *
 * // Stop an app
 * return lando.app.stop(app);
 *
 * // Destroy an app
 * return lando.app.destroy(app);
 *
 * // Get the app called myapp
 * return lando.app.get('myapp')
 * .then(function(app) {
 *   console.log(app);
 * });
 *
 * // Get a list of all the apps
 * return lando.app.list()
 * .then(function(apps) {
 *   console.log(apps);
 * });
 */
'use strict';

// Modules
var _ = require('./node')._;
var config = require('./config');
var docker = require('./docker');
var daemon = require('./daemon');
var lando = require('./lando')(config);
var url = require('url');
var _engine = this;

/*
 * Do some additional bootstrapping prep for our engine
 */
lando.events.on('pre-bootstrap', 1, function(config) {

  // Get the docker config
  var engineConfig = daemon.getEngineConfig();

  // Parse the docker host url
  var dockerHost = url.format({
    protocol: 'tcp',
    slashes: true,
    hostname: engineConfig.host,
    port: engineConfig.port
  });

  // Verify all DOCKER_* vars are stripped on darwin and windows
  _.each(config.env, function(value, key) {
    if (_.includes(key, 'DOCKER_')) {
      delete config.env[key];
    }
  });

  // Add some things to our config
  config.engineHost = engineConfig.host;

  // Set some helpful engine env helpers
  config.env.LANDO_ENGINE_ID = config.engineId;
  config.env.LANDO_ENGINE_GID = config.engineGid;
  config.env.LANDO_ENGINE_HOME = daemon.path2Bind4U(config.home);
  config.env.LANDO_ENGINE_IP = dockerHost;
  var remoteIp = (process.platform === 'linux') ? dockerHost : '192.168.65.1';
  config.env.LANDO_ENGINE_REMOTE_IP = remoteIp;

});

/*
 * Throws an error if the provider is not installed.
 */
var verifyDaemonInstalled = function() {

  // Check if daemon is installed.
  return daemon.isInstalled()

  // Throw error if daemon isn't installed.
  .then(function(isInstalled) {
    if (!isInstalled) {
      throw Error('Lando thinks you might need some help with your droid');
    }
  });

};

/*
 * Starts daemon if not up.
 */
var verifyDaemonUp = function() {

  // Query for provider's up status.
  return daemon.isUp()

  // Turn on provider if needed
  .then(function(isUp) {
    if (!isUp) {
      return _engine.up();
    }
  });

};

/*
 * Verify that the daemon is ready.
 */
var verifyDaemonIsReady = function() {

  // Verify provider is installed.
  return verifyDaemonInstalled()
  // Verify provider is up.
  .then(verifyDaemonUp);

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.up = function() {

  // Verify the provider is already installed.
  return verifyDaemonInstalled()

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-up
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
  .then(function() {
    return lando.events.emit('pre-engine-up');
  })

  // Bring the provider up.
  .then(function() {
    return daemon.up();
  })

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-up
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
  .then(function() {
    return lando.events.emit('post-engine-up');
  });

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.isUp = function() {
  return daemon.isUp();
};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.down = function() {

  // Verify the provider is already installed.
  return verifyDaemonInstalled()

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-down
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
  .then(function() {
    return lando.events.emit('pre-engine-down');
  })

  // Bring the provider down.
  .then(function() {
    return daemon.down({maxRetries: 3});
  })

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-down
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
  .then(function() {
    return lando.events.emit('post-engine-down');
  });

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.isRunning = function(data) {

  return verifyDaemonIsReady()
  .then(function() {
    return docker.isRunning(data);
  });

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.list = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Get list of containers from engine.
  .then(function() {
    return docker.list(data);
  });

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.exists = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Exists
  .then(function() {
    return docker.exists(data);
  });

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.inspect = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Inspect the container.
  .then(function() {
    return docker.inspect(data);
  });

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.start = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-start
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
  .then(function() {
    return lando.events.emit('pre-engine-start', data);
  })

  // Start container.
  .then(function() {
    return docker.start(data);
  })

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-start
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
  .then(function() {
    return lando.events.emit('post-engine-start', data);
  });

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.run = function(data) {

  // Make sure the provider is ready
  return verifyDaemonIsReady()

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-run
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
  .then(function() {
    return lando.events.emit('pre-engine-run', data);
  })

  // Run.
  .then(function() {
    return docker.run(data);
  })

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-run
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
  .tap(function() {
    return lando.events.emit('post-engine-run', data);
  })

  // Return our response
  .tap(function(response) {
    return response;
  });

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.stop = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-stop
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
  .then(function() {
    return lando.events.emit('pre-engine-stop', data);
  })

  // Stop container.
  .then(function() {
    return docker.stop(data);
  })

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-stop
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
  .then(function() {
    return lando.events.emit('post-engine-stop', data);
  });

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.destroy = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-destroy
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
  .then(function() {
    return lando.events.emit('pre-engine-destroy', data);
  })

  // Remove container.
  .then(function() {
    return docker.remove(data);
  })

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-destroy
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
  .then(function() {
    return lando.events.emit('post-engine-destroy', data);
  });

};

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
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
exports.build = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-build
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
  .then(function() {
    return lando.events.emit('pre-engine-build', data);
  })

  // Build image.
  .then(function() {
    return docker.build(data);
  })

  /**
   * Event that allows altering of the config before it is used to
   * instantiate an app object.
   *
   * Note that this is a global event so it is invoked with `lando.events.on`
   * not `app.events.on` See example below:
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-build
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
  .then(function() {
    return lando.events.emit('post-engine-build', data);
  });

};
