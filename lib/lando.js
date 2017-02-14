/**
 * Get a fully initialized lando object
 *
 * @name lando
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

    // Add app module
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

    // Add node helpers
    node: require('./node'),

    // Add metrics module
    metrics: require('./metrics'),

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
