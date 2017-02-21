/**
 * Error module.
 *
 * @name error
 */

'use strict';

// Modules
var _ = require('./node')._;
var log = require('./logger');
var metrics = require('./metrics');

/**
 * Handler errors.
 */
exports.handleError = function(err) {

  // Log the error
  log.error(err);

  // Report error to metrics.
  return metrics.reportError(err)

  // Exit the process with a failure.
  .finally(function() {
    process.exit(1);
  });

};

/**
 * Returns stack trace string of an error.
 */
exports.getStackTrace = function(err) {

  if (!(err instanceof Error)) {
    throw new Error('Object is not an error: ' + err);
  }

  /*jshint camelcase: false */
  /*jscs: disable */
  if (err.jse_cause && err.jse_cause.stack) {
    return err.jse_cause.stack;
  }
  else {
    return err.stack;
  }
  /*jshint camelcase: true */
  /*jscs: enable */

};

/**
 * Small object for adding and getting error tags.
 */
exports.errorTags = {
  add: function(err, tag) {
    if (err instanceof Error) {
      if (!err.tags) {
        err.tags = [];
      }
      err.tags.push(tag);
      err.tags = _.uniq(err.tags);
    }
  },
  get: function(err) {
    if (!err.tags) {
      return [] ;
    } else {
      return err.tags;
    }
  }
};
