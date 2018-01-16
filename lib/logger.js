/**
 * Contains logging functions built from passed in config.
 *
 * Logged entries are printed to the console and to `lando.log` and `error.log`
 * in specified directory. The verbosity of these logs is determined by the
 * lando global config or passed in global CLI option
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
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var winston = require('winston');

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
function Log(opts) {

  // Define the loglevels
  var logLevels = {
    '0': 'error',
    '1': 'warn',
    '2': 'info',
    '3': 'verbose',
    '4': 'debug',
    '5': 'silly'
  };

  // Some overrideable default options
  var logLevelConsole = opts.logLevelConsole || 'warn';
  var logLevel = opts.logLevel || 'debug';

  // If loglevelconsole is numeric lets map it!
  if (_.isInteger(logLevelConsole)) {
    logLevelConsole = logLevels[logLevelConsole] || 'warn';
  }

  // The default console transport
  var transports = [
    new winston.transports.Console({
      level: logLevelConsole,
      colorize: true
    }),
  ];

  // If we have a log path then let's add in some file transports
  if (_.has(opts, 'logDir')) {

    // Ensure the logpath actually exists
    fs.mkdirpSync(opts.logDir);

    // Add in our error log
    transports.push(new winston.transports.File({
      name: 'error-file',
      level: 'warn',
      maxSize: 12500000,
      maxFiles: 2,
      filename: path.join(opts.logDir, 'error.log')
    }));

    // Add in a generic log
    transports.push(new winston.transports.File({
      name: 'log-file',
      level: logLevel,
      maxSize: 25000000,
      maxFiles: 3,
      filename: path.join(opts.logDir, 'lando.log'),
    }));

  }

  // Return the logger
  return new winston.Logger({transports: transports, exitOnError: true});

}

/*
 * Return the logger creation function
 */
module.exports = Log;
