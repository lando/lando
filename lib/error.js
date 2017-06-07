/**
 * Helper functions to help with error handling.
 *
 * @since 3.0.0
 * @module error
 */

'use strict';

// Modules
var _ = require('./node')._;
var log = require('./logger');
var metrics = require('./metrics');

/**
 * Log error, report it and then exit the process with error code 1.
 *
 * @since 3.0.0
 * @param {Object} err - The error
 * @returns {Array} Returns the total.
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
 * Helper function to extract a stack trace from an error object.
 *
 * @since 3.0.0
 * @param {Object} err - The error object
 * @returns {Object} The stack trace object.
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
 * @private
 * Small helper for adding and getting error tags.
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
