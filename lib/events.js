/**
 * Asynchronous event engine module.
 *
 * @name events
 */

'use strict';

// Modules.
var _ = require('./node')._;
var events = require('events');
var Promise = require('./promise');
var sha1 = require('./node').sha1;
var util = require('util');

/*
 * Constructor.
 */
function AsyncEvents() {
  if (this instanceof AsyncEvents) {
    // Map of function sha1 hash -> priority.
    this.priorityMap = {};
    events.EventEmitter.call(this);
  } else {
    return new AsyncEvents();
  }
}

/*
 * Inherit from event emitter.
 */
util.inherits(AsyncEvents, events.EventEmitter);

/*
 * Save reference to the original on method.
 */
AsyncEvents.prototype.__on = AsyncEvents.prototype.on;

/*
 * Custon on method so we can include a priority.
 */
AsyncEvents.prototype.on = function(name, priority, fn) {

  // Default priority.
  if (_.isUndefined(fn) && _.isFunction(priority)) {
    fn = priority;
    priority = 5;
  }

  // Hash handler function.
  var hash = sha1(fn.toString());

  // Store
  this.priorityMap[hash] = priority;

  // Call originl on method.
  return this.__on(name, fn);

};

/*
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
  } else {
    return Promise.resolve(result);
  }
}

/*
 * Custom emit method, used to make emitting block until event handlers are
 * finished.
 * Returns a promise.
 */
AsyncEvents.prototype.emit = function() {
  var self = this;
  // Get args.
  var args = _.toArray(arguments);
  // Grab name of event from first argument.
  var name = args.shift();
  // Get list of listeners order by priority ascending.
  var fns = _(this.listeners(name))
    // Map fn -> fn and priority.
    .map(function(fn) {
      // Get handler function hash.
      var hash = sha1(fn.toString());
      // Lookup priority in map.
      var priority = self.priorityMap[hash];
      return {
        fn: fn,
        priority: priority
      };
    })
    // Sort by priority.
    .sortBy('priority')
    // Map to just fn.
    .map('fn')
    // Execute chain.
    .value();
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
 * Export constructor.
 */
module.exports = AsyncEvents;
