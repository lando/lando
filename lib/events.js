'use strict';

// Modules.
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const Log = require('./logger');
const Promise = require('./promise');

/*
 * Creates a new Events instance.
 */
class AsyncEvents extends EventEmitter {
  constructor(log = new Log()) {
    // Get the event emitter stuffs
    super();
    // Set things
    this.log = log;
    this._listeners = [];
  };

  /**
   * Our overriden event on method.
   *
   * This optionally allows a priority to be specified. Lower priorities run first.
   *
   * @since 3.0.0
   * @alias lando.events.on
   * @param {String} name The name of the event
   * @param {Integer} [priority=5] The priority the event should run in.
   * @param {Function} fn The function to call. Should get the args specified in the corresponding `emit` declaration.
   * @return {Promise} A Promise
   * @example
   * // Print out all our apps as they get instantiated and do it before other `post-instantiate-app` events
   * lando.events.on('post-instantiate-app', 1, app => {
   *   console.log(app);
   * });
   *
   * // Log a helpful message after an app is started, don't worry about whether it runs before or
   * // after other `post-start` events
   * return app.events.on('post-start', () => {
   *   lando.log.info('App %s started', app.name);
   * });
   */
  on(name, priority, fn) {
    // Handle no priority
    // @todo: is there a way to get this working nicely via es6?
    if (_.isUndefined(fn) && _.isFunction(priority)) {
      fn = priority;
      priority = 5;
    }
    // Store
    this._listeners.push({name, priority, fn});
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
   * @alias lando.events.emit
   * @param {String} name The name of the event
   * @param {...Any} [args] Options args to pass.
   * @return {Promise} A Promise
   * @example
   * // Emits a global event with a config arg
   * return lando.events.emit('wolf359', config);
   *
   * // Emits an app event with a config arg
   * return app.events.emit('sector001', config);
   */
  emit(...args) {
    /*
     * Helper function that will always return a promise even if function is
     * synchronous and doesn't return a promise.
     * @todo: this is very old kbox code, can we update it a bit?
     */
    const handle = (...args) => {
      const fn = args.shift();
      const result = fn.apply(this, args);
      return Promise.resolve(result);
    };
    // Save for later
    const self = this;
    // Grab name of event from first argument.
    const name = args.shift();

    // Grab priorty sorted listeners for this event
    const evnts = _(this._listeners)
      // Filter by name
      .filter(listener => listener.name === name)
      // Sort by priority
      .sortBy('priority')
      // Return value
      .value();

    // Map to array of func
    const fns = _.map(evnts, evnt => evnt.fn);

    // Log
    this.log.verbose('Emitting event %s', name);
    this.log.debug('Event %s has %s listeners', name, fns.length);

    // Make listener functions to a promise in series.
    return Promise.each(fns, fn => {
      // Clone function arguments.
      const fnArgs = args.slice();
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

/*
 * Stores the original event on method.
 *
 * I don't think you want to ever really use this. Mentioned only for transparency.
 *
 * @alias lando.events.__on
 * @see https://nodejs.org/api/events.html
 */
AsyncEvents.prototype.__on = EventEmitter.prototype.on;

/*
 * Stores the original event emit method.
 *
 * I don't think you want to ever really use this. Mentioned only for transparency.
 *
 * @alias lando.events.__emit
 * @see https://nodejs.org/api/events.html
 */
AsyncEvents.prototype.__emit = EventEmitter.prototype.emit;

// Set our maxListeners to something more reasonable for lando
AsyncEvents.prototype.setMaxListeners(20);

/*
 * Return the class
 */
module.exports = AsyncEvents;
