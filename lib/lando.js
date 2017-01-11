/**
 * Get a fully initialized lando object
 *
 * @name lando
 */

'use strict';

// Modules
var _ = require('./node')._;
var AsyncEvents = require('./events');

/**
 * Return lando
 *
 * @param  {object} config The config
 * @return {object} The lando object
 */
module.exports = _.once(function(config) {

  // Create the lando object
  var lando = {

    // Add bootstrap module
    bootstrap: require('./bootstrap'),

    // Add cache module
    cache: require('./cache'),

    // Set the config
    config: config,

    // Add env module
    env: require('./env'),

    // Add error module
    error: require('./error'),

    // Add an event handler
    events: new AsyncEvents(),

    // Add log module
    log: require('./logger'),

    // Add node helpers
    node: require('./node'),

    // Add plugin module
    plugins: require('./plugins'),

    // Add promise module
    Promise: require('./promise'),

    // Add task module
    tasks: require('./tasks'),

    // Add user module
    user: require('./user')

  };

  // Return lando
  return lando;

});
