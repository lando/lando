'use strict';

// Modules.
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const Log = require('./logger');
const Promise = require('./promise');

/*
 * Creates a new Events instance.
 *
 * @param {object} opts
 * @return
 */
class AsyncEvents extends EventEmitter {
  constructor(log = new Log()) {
    // Get the event emitter stuffs
    super();
    // Set things
    this.log = log;
    this._listeners = [];
  }

  /**
   * Our overriden event on method.
   *
   * This optionally allows a priority to be specified. Lower priorities run first.
   *
   * @since 3.0.0
   * @alias 'lando.events.on'
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
  on(name, priority, fn) {

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
    this.log.verbose('Loading event %s priority %s', name, priority);

    // Call originl on method.
    return this.__on(name, fn);

  };


  /**
   * Reimplements event emit method.
   *
   * This makes events blocking and promisified.
   *
   * @since 3.0.0
   * @alias 'lando.events.emit'
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
  emit() {

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
    this.log.verbose('Emitting event %s', name);
    this.log.debug('Event %s has %s listeners', name, fns.length);

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

};

/**
 * Stores the original event on method.
 *
 * I don't think you want to ever really use this. Mentioned only for transparency.
 *
 * @alias 'lando.events.__on'
 * @see https://nodejs.org/api/events.html
 */
AsyncEvents.prototype.__on = EventEmitter.prototype.on;

/**
 * Stores the original event emit method.
 *
 * I don't think you want to ever really use this. Mentioned only for transparency.
 *
 * @alias 'lando.events.__emit'
 * @see https://nodejs.org/api/events.html
 */
AsyncEvents.prototype.__emit = EventEmitter.prototype.emit;

// Set our maxListeners to something more reasonable for lando
AsyncEvents.prototype.setMaxListeners(20);

/*
 * Return the class
 */
module.exports = AsyncEvents;
