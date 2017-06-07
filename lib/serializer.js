/**
 * Class for abstracting serializing of promises within the process.
 *
 * @module serializer
 */

'use strict';

// Modules.
var Promise = require('./promise');

/**
 * Constructor.
 */
function Serializer(opts) {
  if (this instanceof Serializer) {
    opts = opts || {};
    this.opts = opts;
    this._p = Promise.resolve();
  } else {
    return new Serializer(opts);
  }
}

/**
 * Add a function to the serialized queue.
 */
Serializer.prototype.enqueue = function(fn) {
  var self = this;
  // Create a new promise that resolves with callback.
  return Promise.fromNode(function(cb) {
    // Add another promise to the end of the promise chain.
    self._p = self._p.then(function() {
      // Run function.
      return fn.call(self);
    })
    // Make sure errors don't stop the promise chain.
    .catch(function(err) {
      cb(err);
    })
    .nodeify(cb);
  });
};

/**
 * Export the constructor.
 */
module.exports = Serializer;
