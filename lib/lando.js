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
 * // Start an app
 * return lando.app.start(app);
 *
 * // Check to see if a docker container is running
 * return lando.engine.isRunning({id: 'myapps_httpd_1'});
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
 * // Remove an app from the registry
 * return lando.registry.remove({app: name, dir: dir});
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
var _ = require('./node')._;
var AsyncEvents = require('./events');
var events = new AsyncEvents();

/*
 * Return lando
 */
module.exports = _.memoize(function(config) {

  // Create the lando object
  var lando = {

    /**
     * The app module.
     *
     * Contains helpful methods to manipulate Lando apps.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link app.md}
     */
    app: require('./app'),

    /**
     * The bootstrap module.
     *
     * Contains helpful methods to bootstrap Lando.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link bootstrap.md}
     */
    bootstrap: require('./bootstrap'),

    /**
     * The cache module.
     *
     * Contains helpful methods to cache data.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link cache.md}
     */
    cache: require('./cache'),

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
     * The engine module.
     *
     * Contains helpful methods to manipulate the docker daemon, engine, its containers,
     * volumes and networks.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link engine.md}
     */
    engine: require('./engine'),

    /**
     * The error module.
     *
     * Contains helpful error handling methods.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link error.md}
     */
    error: require('./error'),

    /**
     * The events module.
     *
     * An instance of AsyncEvents.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link events.md}
     */
    events: events,

    /**
     * The logging module.
     *
     * Contains logging methods.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link log.md}
     */
    log: require('./logger'),

    /**
     * The metrics module.
     *
     * @since 3.0.0
     * @memberof lando
     * @private
     */
    metrics: require('./metrics'),

    /**
     * The networks module.
     *
     * Contains ways to interact with docker networks.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link networks.md}
     */
    networks: require('./networks'),

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
    plugins: require('./plugins'),

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
     * The registry module.
     *
     * Contains helpful methods to interact with the appRegistry.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link registry.md}
     */
    registry: require('./registry'),

    /**
     * The shell module.
     *
     * Contains helpful methods to parse and execute commands.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link shell.md}
     */
    shell: require('./shell'),

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
    utils: require('./utils'),

    /**
     * The yaml module.
     *
     * Contains helpful yaml methods.
     *
     * @since 3.0.0
     * @memberof lando
     * @see {@link yaml.md}
     */
    yaml: require('./yaml')

  };

  // Return lando
  return lando;

});
