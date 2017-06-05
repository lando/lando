/**
 * Contains logging functions built from global config options.
 *
 * Logged entries are printed to the console and to `lando.log` and `error.log`
 * in `$HOME/.lando/logs`. The verbosity of these logs is determined by the
 * lando global config.
 *
 * @since 3.0.0
 * @module log
 * @example
 *
 * // Log an error message
 * lando.log.error('This is an err with details %j', err);
 *
 * // Log a silly message
 * lando.log.silly('This is probably too much logging!');
 *
 * // Log an info message
 * lando.log.info('Loaded up the %s app', appName);
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
  var cliLevel = tasks.largv.verbose + 1 || 0;

  // Get the log level from the config
  var confLevel = getLogLevel(config.logLevelConsole) || 0;

  // Get the max log level between the two
  var maxLog = _.max([cliLevel, confLevel]);

  // Use MAX cli or conf or warn by default
  return logLevels[maxLog] || 'warn';

};

/**
 * Logs an error message.
 *
 * @since 3.0.0
 * @name error
 * @static
 * @kind method
 * @param {String} msg - A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] - Values to be passed `utils.format()`
 * @example
 *
 * // Log an error message
 * lando.log.error('This is an err with details %j', err);
 */
/**
 * Logs a warning message.
 *
 * @since 3.0.0
 * @name warn
 * @static
 * @kind method
 * @param {String} msg - A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] - Values to be passed `utils.format()`
 * @example
 *
 * // Log a warning message
 * lando.log.warning('Something is up with app %s in directory %s', appName, dir);
 */
/**
 * Logs an info message.
 *
 * @since 3.0.0
 * @name info
 * @static
 * @kind method
 * @param {String} msg - A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] - Values to be passed `utils.format()`
 * @example
 *
 * // Log an info message
 * lando.log.info('It is happening!');
 */
/**
 * Logs a verbose message.
 *
 * @since 3.0.0
 * @name verbose
 * @static
 * @kind method
 * @param {String} msg - A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] - Values to be passed `utils.format()`
 * @example
 *
 * // Log a verbose message
 * lando.log.verbose('Config file %j loaded from %d', config, directory);
 */
/**
 * Logs a debug message.
 *
 * @since 3.0.0
 * @name debug
 * @static
 * @kind method
 * @param {String} msg - A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] - Values to be passed `utils.format()`
 * @example
 *
 * // Log a debug message
 * lando.log.debug('All details about docker inspect %j', massiveObject);
 */
/**
 * Logs a silly message.
 *
 * @since 3.0.0
 * @name silly
 * @static
 * @kind method
 * @param {String} msg - A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] - Values to be passed `utils.format()`
 * @example
 *
 * // Log a silly message
 * lando.log.silly('All details about all the things', unreasonablySizedObject);
 *
 * // Log a silly message
 * lando.log.silly('If you are seeing this you have delved too greedily and too deep and likely have awoken something.');
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

/*
 * Return the logger
 */
module.exports = log();
