'use strict';

// Modules.
const Promise = require('./promise');

/*
 * Creates a new Events instance.
 * @todo: Document this better?
 */
class Serializer {
  constructor(opts = {}) {
    this.opts = opts;
    this.last = Promise.resolve();
  };

  enqueue(fn) {
    const self = this;
    // Create a new promise that resolves with callback.
    return Promise.fromNode(cb => {
      // Add another promise to the end of the promise chain.
      self.last = self.last.then(() => fn.call(self))
      // Make sure errors don't stop the promise chain.
      .catch(err => {
        cb(err);
      })
      // Nodeify
      .nodeify(cb);
    });
  };
};

/*
 * Export the constructor.
 */
module.exports = Serializer;
