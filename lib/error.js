/**
 * Main error module
 *
 * @name error
 */

'use strict';

// Get modules
var chalk = require('./node').chalk;
var log = require('./logger');

/**
 * Returns stack trace string of an error.
 */
var getStackTrace = function(err) {

  if (!err instanceof Error) {
    throw new Error('Object is not an error: ' + err);
  }

  /*jshint camelcase: false */
  /*jscs: disable */
  if (err.jse_cause && err.jse_cause.stack) {
    return err.jse_cause.stack;
  } else {
    return err.stack;
  }
  /*jshint camelcase: true */
  /*jscs: enable */

};

/*
 * Handler errors.
 */
exports.handleError = function(err) {

  // Print error message.
  console.log(chalk.red(err.message));

  // Print stack trace.
  console.log(chalk.red(getStackTrace(err)));

  // Log error to local log.
  return log.error(err)
  // Exit the process with a failure.
  .finally(function() {
    process.exit(1);
  });

};
