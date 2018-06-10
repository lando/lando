'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const winston = require('winston');
const logLevels = {
  '0': 'error',
  '1': 'warn',
  '2': 'info',
  '3': 'verbose',
  '4': 'debug',
  '5': 'silly',
};

/**
 * Logs a debug message.
 *
 * @since 3.0.0
 * @function
 * @name lando.log.debug
 * @alias lando.log.debug
 * @param {String} msg A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] Values to be passed `utils.format()`
 * @example
 * // Log a debug message
 * lando.log.debug('All details about docker inspect %j', massiveObject);
 */
/**
 * Logs an error message.
 *
 * @since 3.0.0
 * @function
 * @name lando.log.error
 * @alias lando.log.error
 * @param {String} msg A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] Values to be passed `utils.format()`
 * @example
 * // Log an error message
 * lando.log.error('This is an err with details %j', err);
 */
/**
 * Logs an info message.
 *
 * @since 3.0.0
 * @function
 * @name lando.log.info
 * @alias lando.log.info
 * @param {String} msg A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] Values to be passed `utils.format()`
 * @example
 * // Log an info message
 * lando.log.info('It is happening!');
 */
/**
 * Logs a silly message.
 *
 * @since 3.0.0
 * @function
 * @name lando.log.silly
 * @alias lando.log.silly
 * @param {String} msg A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] Values to be passed `utils.format()`
 * @example
 * // Log a silly message
 * lando.log.silly('All details about all the things', unreasonablySizedObject);
 *
 * // Log a silly message
 * lando.log.silly('If you are seeing this you have delved too greedily and too deep and likely have awoken something.');
 */
/**
 * Logs a verbose message.
 *
 * @since 3.0.0
 * @function
 * @name lando.log.verbose
 * @alias lando.log.verbose
 * @param {String} msg A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] Values to be passed `utils.format()`
 * @example
 * // Log a verbose message
 * lando.log.verbose('Config file %j loaded from %d', config, directory);
 */
/**
 * Logs a warning message.
 *
 * @since 3.0.0
 * @function
 * @name lando.log.warn
 * @alias lando.log.warn
 * @param {String} msg A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] Values to be passed `utils.format()`
 * @example
 * // Log a warning message
 * lando.log.warning('Something is up with app %s in directory %s', appName, dir);
 */
module.exports = class Log {
  constructor(opts = {logLevelConsole: 'warn', logLevel: 'debug'}) {
    // If loglevelconsole is numeric lets map it!
    if (_.isInteger(opts.logLevelConsole)) opts.logLevelConsole = logLevels[opts.logLevelConsole];

    // The default console transport
    const transports = [
      new winston.transports.Console({
        level: opts.logLevelConsole,
        colorize: true,
      }),
    ];

    // If we have a log path then let's add in some file transports
    if (opts.logDir) {
      // Ensure the logpath actually exists
      fs.mkdirpSync(opts.logDir);
      // Add in our generic and error logs
      transports.push(new winston.transports.File({
        name: 'error-file',
        level: 'warn',
        maxSize: 12500000,
        maxFiles: 2,
        filename: path.join(opts.logDir, 'error.log'),
      }));
      transports.push(new winston.transports.File({
        name: 'log-file',
        level: opts.logLevel,
        maxSize: 25000000,
        maxFiles: 3,
        filename: path.join(opts.logDir, 'lando.log'),
      }));
    }

    // Return the logger
    return new winston.Logger({transports: transports, exitOnError: true});
  }
};
