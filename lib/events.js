/**
 * Asynchronous event engine module.
 *
 * @name events
 */

'use strict';

// Modules.
var _ = require('./node')._;
var events = require('events');
var log = require('./logger');
var Promise = require('./promise');
var util = require('util');

/*
 * Constructor.
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

/**
 * Save reference to the original on method.
 */
AsyncEvents.prototype.__on = AsyncEvents.prototype.on;

/**)
 * Custon on method so we can include a priority.
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
 * Save reference to the original emit method.
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
 * Custom emit method, used to make emitting block until event handlers are
 * finished.
 * Returns a promise.
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

/**
 * Export constructor.
 */
module.exports = AsyncEvents;
