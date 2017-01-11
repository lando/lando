/**
 * Error module.
 *
 * @name error
 */

'use strict';

// Modules
var log = require('./logger');

/**
 * Handler errors.
 */
exports.handleError = function(err) {

  // Log error to local log.
  return log.error(err)

  // Exit the process with a failure.
  .finally(function() {
    process.exit(1);
  });

};
