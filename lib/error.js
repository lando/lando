'use strict';

// Modules
const Log = require('./logger');
const Metrics = require('./metrics');

module.exports = class ErrorHandler {
  constructor(log = new Log(), metrics = new Metrics()) {
    this.log = log;
    this.metrics = metrics;
  };

  /**
   * Returns the lando options
   *
   * This means all the options passed in before the `--` flag.
   *
   * @since 3.0.0
   * @alias lando.error.handle
   * @return {Object} Yarg parsed options
   * @example
   * // Gets all the pre-global options that have been specified.
   * const argv = lando.tasks.argv();
   * @todo make this static and then fix all call sites
   */
  handle({message, stack, code = 1, hide = false, verbose = 0} = {}) {
    // Log error or not
    if (!hide) {
      if (verbose > 0) this.log.error(stack);
      else this.log.error(message);
    }

    // Report error if we can
    this.metrics.report('error', {message: message, stack: stack});
    return code;
  };
};
