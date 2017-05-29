/**
 * Things Things Things Things Things Things Things Things Things Things
 * Things Things Things Things Things Things
 * Things Things Things Things Things Things Things Things
 * Things Things Things Things Things Things
 *
 * @namespace lando
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
     * @alias app
     * @memberof lando
     * @namespace app
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
    app: require('./app'),

    // Add bootstrap module
    bootstrap: require('./bootstrap'),

    // Add cache module
    cache: require('./cache'),

    // Add cli module
    cli: require('./cli'),

    // Set the config
    config: config,

    // Add engine module
    engine: require('./engine'),

    // Add error module
    error: require('./error'),

    // Add an event handler
    events: events,

    // Add log module
    log: require('./logger'),

    // Add metrics module
    metrics: require('./metrics'),

    // Add node helpers
    node: require('./node'),

    // Add network module
    networks: require('./networks'),

    // Add plugin module
    plugins: require('./plugins'),

    // Add promise module
    Promise: require('./promise'),

    // Add shell module
    shell: require('./shell'),

    // Add tasks module
    tasks: require('./tasks'),

    // Add utils module
    utils: require('./utils'),

  };

  // Return lando
  return lando;

});
