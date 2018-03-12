'use strict';

/**
 * Extends [bluebird](http://bluebirdjs.com/docs/api-reference.html)
 * so that our promises have some retry functionality.
 *
 * All functionality should be the same as bluebird except where indicated
 * below
 *
 * @member
 * @alias 'lando.Promise'
 * @see http://bluebirdjs.com/docs/api-reference.html
 */
var Promise = require('bluebird');

// Use long stack traces.
Promise.longStackTraces();

/*
 * Retry the function fn up to opts.max times until it successfully completes
 * without an error. Pause opts.backoff * retry miliseconds between tries.
 */
function retry(promise, fn, opts) {

  // Piggy back off of previous promise.
  return promise.then(function() {

    // Setup default options.
    opts = opts || {};
    opts.max = opts.max || 5;
    opts.backoff = opts.backoff || 500;

    // Recursive function.
    var rec = function(counter) {

      // Call function fn within the context of a Promise.
      return Promise.try(function() {
        return fn(counter);
      })
      // Handle errors.
      .catch(function(err) {

        // If we haven't reached max retries, delay for a short while and
        // then retry.
        if (counter < opts.max) {

          return Promise.delay(opts.backoff * counter)
          .then(function() {
            return rec(counter + 1);
          });

        } else {

          // No retries left so wrap and throw the error.
          throw new Error(
            err,
            'Failed after %s retries. %s',
            opts.max,
            JSON.stringify(opts)
          );

        }
      });

    };

    // Init recursive function.
    return rec(1);

  });

}

/*
 * Adds a retry method to the bluebird Promise module.
 */
Promise.retry = function(fn, opts) {
  return retry(Promise.resolve(), fn, opts);
};

/**
 * Adds a retry method to all Promise instances.
 *
 * @since 3.0.0
 * @alias 'lando.Promise.retry'
 * @param {Function} fn - The function to retry.
 * @param {Opts} [opts] - Options to specify how retry works.
 * @param {Integer} [opts.max=5] - The amount of times to retry.
 * @param {Integer} [opts.backoff=500] - The amount to wait between retries. In miliseconds and cumulative.
 * @returns {Promise} A Promise
 * @example
 *
 * // Start the deamon
 * return serviceCmd(['start'], opts)
 *
 * // And then retry 25 times until we've connected, increase delay between retries by 1 second
 * .retry(function() {
 *   log.verbose('Trying to connect to daemon.');
 *   return shell.sh([DOCKER_EXECUTABLE, 'info'], {mode: 'collect'});
 * }, {max: 25, backoff: 1000});
 *
 */
Promise.prototype.retry = function(fn, opts) {
  return retry(this, fn, opts);
};

// Export the promise object
module.exports = Promise;
