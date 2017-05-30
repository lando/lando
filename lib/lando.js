/**
 * This is the high level object wrapper that contains the Lando libraries.
 * Using this you can:
 *
 *  * Perform actions on Lando apps
 *  * Bootstrap Lando
 *  * Access caching utilities
 *  *
 *
 * @since 3.0.0
 * @namespace lando
 * @param {object} config [description]
 * @example
 * // Instantiate the Lando object
 * var lando = require('./lando')(config);
 *
 * // Map each app to a summary and print results
 * .map(function(app) {
 *  return appSummary(app)
 *   .then(function(summary) {
 *    console.log(JSON.stringify(summary, null, 2));
 *  });
 * });
 */

'use strict';

// Modules
var _ = require('./node')._;
var AsyncEvents = require('./events');
var events = new AsyncEvents();

/**
 * Return lando
 *
 * @param  {object} config The config
 * @return {object} The lando object
 */
module.exports = _.memoize(function(config) {

  // Create the lando object
  var lando = {

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link app.md}
     * @memberof lando
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
    app: require('./app'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link bootstrap.md}
     * @memberof lando
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
    bootstrap: require('./bootstrap'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link cache.md}
     * @memberof lando
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
    cache: require('./cache'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link cli.md}
     * @memberof lando
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
    cli: require('./cli'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link config.md}
     * @memberof lando
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
    config: config,

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link engine.md}
     * @memberof lando
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
    engine: require('./engine'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link error.md}
     * @memberof lando
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
    error: require('./error'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link events.md}
     * @memberof lando
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
    events: events,

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link logger.md}
     * @memberof lando
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
    log: require('./logger'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link metrics.md}
     * @memberof lando
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
    metrics: require('./metrics'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link networks.md}
     * @memberof lando
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
    networks: require('./networks'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link node.md}
     * @memberof lando
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
    node: require('./node'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link plugins.md}
     * @memberof lando
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
    plugins: require('./plugins'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link promise.md}
     * @memberof lando
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
    Promise: require('./promise'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link shell.md}
     * @memberof lando
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
    shell: require('./shell'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link tasks.md}
     * @memberof lando
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
    tasks: require('./tasks'),

    /**
     * Lists all the Lando apps
     *
     * @since 3.0.0
     * @see {@link utils.md}
     * @memberof lando
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
    utils: require('./utils'),

  };

  // Return lando
  return lando;

});
