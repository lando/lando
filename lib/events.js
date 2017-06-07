/*
 * Extends core node event emitter.
 */

'use strict';

// Modules.
var _ = require('./node')._;
var events = require('events');
var log = require('./logger');
var Promise = require('./promise');
var util = require('util');

/**
 * Creates a new AsyncEvents emitter.
 *
 * @class AsyncEvents
 * @extends events.EventEmitter
 * @classdec Extends the core node events.EventEmitter so that it is promisified, blocking and with event priorities.
 */
function AsyncEvents() {
  if (this instanceof AsyncEvents) {
    this._listeners = [];
    events.EventEmitter.call(this);
  }
  else {
    return new AsyncEvents();
  }
}

/*
 * Inherit from event emitter.
 */
util.inherits(AsyncEvents, events.EventEmitter);

// Set our maxListeners to something more reasonable for lando
AsyncEvents.prototype.setMaxListeners(20);

/**
 * Stores the old event on method.
 *
 * @see https://nodejs.org/api/events.html#events_emitter_on_eventname_listener
 */
AsyncEvents.prototype.__on = AsyncEvents.prototype.on;

/**
 * Reimplements event on method.
 *
 * This optionally allows a priority to be specified. Lower priorities run first.
 *
 * @since 3.0.0
 * @param {String} name - The name of the event
 * @param {Integer} [priority=5] - The priority the event should run in.
 * @param {Function} fn - The function to call. Should get the args specified in the corresponding `emit` declaration.
 * @returns {Promise} A Promise
 * @example
 *
 * // Print out all our apps as they get instantiated and do it before other `post-instantiate-app` events
 * lando.events.on('post-instantiate-app', 1, function(app) {
 *   console.log(app);
 * });
 *
 * // Log a helpful message after an app is started, don't worry about whether it runs before or
 * // after other `post-start` events
 * return app.events.on('post-start', function() {
 *   lando.log.info('App %s started', app.name);
 * });
 */
AsyncEvents.prototype.on = function(name, priority, fn) {

  // Default priority.
  if (_.isUndefined(fn) && _.isFunction(priority)) {
    fn = priority;
    priority = 5;
  }

  // Build event for storage
  var evnt = {
    name: name,
    priority: priority,
    fn: fn
  };

  // Store
  this._listeners.push(evnt);

  // Log
  log.verbose('Loading event %s priority %s', name, priority);

  // Call originl on method.
  return this.__on(name, fn);

};

/**
 * Stores the old event emit method.
 *
 * @see https://nodejs.org/api/events.html#events_emitter_emit_eventname_args
 */
AsyncEvents.prototype.__emit = AsyncEvents.prototype.emit;

/*
 * Helper function that will always return a promise even if function is
 * synchronous and doesn't return a promise.
 */
function handle() {
  var args = _.toArray(arguments);
  var fn = args.shift();
  var result = fn.apply(this, args);
  if (result instanceof Promise) {
    return result;
  }
  else {
    return Promise.resolve(result);
  }
}

/**
 * Reimplements event emit method.
 *
 * This makes events blocking and promisified.
 *
 * @since 3.0.0
 * @param {String} name - The name of the event
 * @param {...Any} [args] - Options args to pass.
 * @returns {Promise} A Promise
 * @example
 *
 * // Emits a global event with a config arg
 * return lando.events.emit('wolf359', config);
 *
 * // Emits an app event with a config arg
 * return app.events.emit('sector001', config);
 */
AsyncEvents.prototype.emit = function() {

  // Save for later
  var self = this;

  // Get args.
  var args = _.toArray(arguments);

  // Grab name of event from first argument.
  var name = args.shift();

  // Grab priorty sorted listeners for this event
  var evnts = _.sortBy(_.filter(this._listeners, function(listener) {
    return listener.name === name;
  }), 'priority');

  // Map to array of func
  var fns = _.map(evnts, function(evnt) {
    return evnt.fn;
  });

  // Log
  log.verbose('Emitting event %s', name);
  log.debug('Event %s has %s listeners', name, fns.length);

  // Make listener functions to a promise in series.
  return Promise.each(fns, function(fn) {

    // Clone function arguments.
    var fnArgs = args.slice();

    // Add listener function to front of arguments.
    fnArgs.unshift(fn);

    // Apply function that calls the listener function and returns a promise.
    return handle.apply(self, fnArgs);

  })

  // Make sure to wait for all mappings.
  .all()

  // Return true if event had listeners just like the original emit function.
  .return(!!fns.length);

};

/*
 * Return the class
 */
module.exports = AsyncEvents;
