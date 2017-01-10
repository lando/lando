/**
 * Main logging module
 *
 * @name logger
 */

'use strict';

// Modules
var winston = require('winston');

/*
 * Get our log level
 */
var getLogLevel = function() {

  // Log levels
  var logLevels = {
    '0': 'error',
    '1': 'info',
    '2': 'verbose'
  };

  // Get the level if its in our args
  var level = require('yargs')
    .global('verbose')
    .count('verbose')
    .alias('v', 'verbose')
    .argv.verbose;

  // Use commanded level or default to error
  return logLevels[level] || 'error';

};

/*
 * Setup our logger
 */
var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: getLogLevel(),
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

// Return our logger
module.exports = logger;
module.exports.stream = {
  write: function(message/*, encoding*/) {
    logger.info(message);
  }
};
