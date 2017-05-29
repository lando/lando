/**
 * Things Things Things Things Things Things Things Things Things Things
 * Things Things Things Things Things Things
 * Things Things Things Things Things Things Things Things
 * Things Things Things Things Things Things
 *
 * @namespace error
 */

'use strict';

// Modules
var _ = require('./node')._;
var log = require('./logger');
var metrics = require('./metrics');

/**
 * Lists all the Lando apps
 *
 * @since 3.0.0
 * @alias handleError
 * @memberof error
 * @namespace handleError
 * @param {Object} [opts] Things
 * @returns {Array} Returns the total.
 * @example
 *
 * // List all the apps
 * return lando.app.list()
 *
 * // Map each app to a summary and print results
 * .map(function(app) {
 *  return appSummary(app)
 *   .then(function(summary) {
 *    console.log(JSON.stringify(summary, null, 2));
 *  });
 * });
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
 * Lists all the Lando apps
 *
 * @since 3.0.0
 * @alias getStackTrace
 * @memberof error
 * @namespace getStackTrace
 * @param {Object} [opts] Things
 * @returns {Array} Returns the total.
 * @example
 *
 * // List all the apps
 * return lando.app.list()
 *
 * // Map each app to a summary and print results
 * .map(function(app) {
 *  return appSummary(app)
 *   .then(function(summary) {
 *    console.log(JSON.stringify(summary, null, 2));
 *  });
 * });
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
