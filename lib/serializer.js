'use strict';

// Modules.
const Promise = require('./promise');

/*
 * Creates a new Events instance.
 * @todo: Document this better?
 */
module.exports = class Serializer {
  constructor(opts = {}) {
    this.opts = opts;
    this.last = Promise.resolve();
  };

  enqueue(fn) {
    this.last = this.last.then(() => fn.call(this))
    .catch(err => Promise.reject(err));
    return this.last;
  };
};
