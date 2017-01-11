/**
 * Logging module
 *
 * @name logger
 */

'use strict';

// Modules
var _ = require('./node')._;
var config = require('./config');
var fs = require('./node').fs;
var path = require('path');
var tasks = require('./tasks');
var winston = require('winston');

/*
 * Log levels
 */
var logLevels = {
  '0': 'error',
  '1': 'warn',
  '2': 'info',
  '3': 'verbose',
  '4': 'debug',
  '5': 'silly'
};

/*
 * Get log level based on value
 */
var getLogLevel = function(value) {
  return _.findKey(logLevels, function(level) {
    return value === level;
  });
};

/*
 * Get our log level
 */
var getLogLevelConsole = function() {

  // If we are in the GUI then assume the higest level here
  if (config.mode === 'gui') {
    return 'debug';
  }

  // Otherwise get the log level from the args
  var cliLevel = tasks.verbose + 1 || 0;

  // Get the log level from the config
  var confLevel = getLogLevel(config.logLevelConsole) || 0;

  // Get the max log level between the two
  var maxLog = _.max([cliLevel, confLevel]);

  // Use MAX cli or conf or warn by default
  return logLevels[maxLog] || 'warn';

};

/*
 * Setup our logger
 */
var log = function() {

  // Get the log root and create if needed
  var logRoot = path.join(config.userConfRoot, 'logs');
  fs.mkdirpSync(logRoot);

  // Build the logger
  var logger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: getLogLevelConsole(),
        colorize: true
      }),
      new winston.transports.File({
        name: 'error-file',
        level: 'warn',
        filename: path.join(logRoot, 'error.log')
      }),
      new winston.transports.File({
        name: 'log-file',
        level: config.logLevel,
        filename: path.join(logRoot, 'lando.log'),
      })
    ],
    exitOnError: true
  });

  // Return the logger
  return logger;

};

/**
 * Return the logger
 */
module.exports = log();
