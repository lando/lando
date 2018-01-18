/**
 * This is the high level object that contains the Lando libraries.
 *
 * @since 3.0.0
 * @namespace lando
 * @example
 *
 * // Get lando
 * var lando = require('./lando')(globalConfig);
 *
 * // Add an item to the cache
 * lando.cache.set('mykey', data);
 *
 * // Log an error
 * lando.log.error('Ive got a baaaad feeling about this');
 *
 * // Access a global config property
 * var plugins = lando.config.plugins;
 *
 * // Emit an event
 * return lando.events.emit('battle-of-yavin', fleetOpts);
 *
 * // Run a function when an event is triggered
 * return lando.events.on('battle-of-yavin', stayOnTarget);
 *
 * // Get the lodash module for our plugin
 * var _ = lando.node._;
 *
 * // Retry a function with a Promise.
 * return lando.Promise.retry(lando.engine.start(container)));
 *
 * // Load a plugin
 * return lando.plugins.load('hyperdrive');
 *
 * // Execute a command
 * return lando.shell.sh(['docker', 'info']);
 *
 * // Add a new task to Lando
 * lando.tasks.add('fireeverything', task);
 *
 */

'use strict';

// Modules
var _ = require('lodash');
var AsyncEvents = require('./events');
var Cache = require('./cache');
var Log = require('./logger');
var Metrics = require('./metrics');
var path = require('path');

/*
 * Return lando
 */
module.exports = _.memoize(function(config) {

  // Instantiate a logger so we can set it here and inject it into our
  // other modules as needed
  var log = new Log(config);

  // Cache config
  var cacheConfig = {
    log: log,
    cacheDir: path.join(config.userConfRoot, 'cache')
  };

  // Metrics config
  var metricsConfig = {
    log: log,
    idDir: config.userConfRoot,
    endpoints: config.stats,
    data: {
      devMode: false,
      nodeVersion: process.version,
      mode: config.mode || 'unknown',
      os: config.os,
      version: config.version,
    }
  };

  // Create the lando object
  var lando = {

    /**
     * The cache module.
     *
     * Contains helpful methods to cache data.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link cache.md}
     */
    cache: new Cache(cacheConfig),

    /**
     * The cli module.
     *
     * Contains helpful methods to init a CLI, inject commands and display CLI data.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link cli.md}
     */
    cli: require('./cli'),

    /**
     * The global config object
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link config.md}
     */
    config: config,

    /**
     * The events module.
     *
     * An instance of AsyncEvents.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link events.md}
     */
    events: new AsyncEvents(log),

    /**
     * The logging module.
     *
     * Contains logging methods.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link log.md}
     */
    log: log,

    /**
     * The metrics module.
     *
     * @since 3.0.0
     * @memberof lando
     * @private
     */
    metrics: new Metrics(metricsConfig),

    /**
     * The node module.
     *
     * Contains helpful node modules like `lodash` and `restler` that can be
     * used in plugins.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link node.md}
     */
    node: require('./node'),

    /**
     * The plugins module.
     *
     * Contains helpful methods to load Lando plugins.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link plugins.md}
     */
    plugins: require('./plugins')(log),

    /**
     * The Promise module.
     *
     * An extended `bluebird` Promise object.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link promise.md}
     */
    Promise: require('./promise'),

    /**
     * The shell module.
     *
     * Contains helpful methods to parse and execute commands.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link shell.md}
     */
    shell: require('./shell')(log),

    /**
     * The tasks module.
     *
     * Contains helpful methods to define and parse Lando tasks.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link tasks.md}
     */
    tasks: require('./tasks'),

    /**
     * The update module.
     *
     * Contains warnings and help if update is needed
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link update.md}
     */
    updates: require('./updates'),

    /**
     * The user module.
     *
     * Contains helpful methods to get information about user running Lando.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link user.md}
     */
    user: require('./user'),

    /**
     * The utils module.
     *
     * Contains helpful utility methods.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link utils.md}
     */
    utils: {config: require('./config')},

    /**
     * The yaml module.
     *
     * Contains helpful yaml methods.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link yaml.md}
     */
    yaml: require('./yaml')(log)

  };

  // Return lando
  return lando;

});
