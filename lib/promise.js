'use strict';

/**
 * Extends [bluebird](http://bluebirdjs.com/docs/api-reference.html)
 * so that our promises have some retry functionality.
 *
 * All functionality should be the same as bluebird except where indicated
 * below
 *
 * Note that bluebird currently wants you to use scoped prototypes to extend
 * it rather than the normal extend syntax so that is why this is using the "old"
 * way
 *
 * @member
 * @alias lando.Promise
 * @see http://bluebirdjs.com/docs/api-reference.html
 * @see https://github.com/petkaantonov/bluebird/issues/1397
 */
const Promise = require('bluebird');
const format = require('util').format;

// Use long stack traces.
Promise.longStackTraces();

/*
 * Retry the function fn up to max times until it successfully completes
 * without an error. Pause backoff * retry miliseconds between tries.
 */
const retry = (fn, {max = 5, backoff = 500} = {}) => Promise.resolve().then(() => {
  const rec = counter => Promise.try(() => fn(counter)
    .catch(err => {
      if (counter <= max) {
        return Promise.delay(backoff * counter).then(() => rec(counter + 1));
      } else {
        throw new Error(format('Failed after %s retries with backoff %s and error %j', max, backoff, err));
      }
    }));

  // Init recursive function.
  return rec(1);
});

/*
 * Adds a retry method to the bluebird Promise module.
 */
Promise.retry = retry;

/**
 * Adds a retry method to all Promise instances.
 *
 * @since 3.0.0
 * @alias lando.Promise.retry
 * @param {Function} fn The function to retry.
 * @param {Opts} [opts] Options to specify how retry works.
 * @param {Integer} [opts.max=5] The amount of times to retry.
 * @param {Integer} [opts.backoff=500] The amount to wait between retries. In miliseconds and cumulative.
 * @return {Promise} A Promise
 * @example
 * // And then retry 25 times until we've connected, increase delay between retries by 1 second
 * Promise.retry(someFunction, {max: 25, backoff: 1000});
 *
 */
Promise.prototype.retry = retry;

// Export the promise object
module.exports = Promise;
