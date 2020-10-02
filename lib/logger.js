'use strict';

// Modules
const _ = require('lodash');
const dayjs = require('dayjs');
const mkdirp = require('mkdirp');
const path = require('path');
const serialize = require('winston/lib/winston/common').serialize;
const util = require('util');
const winston = require('winston');

// Constants
const logLevels = {
  '0': 'error',
  '1': 'warn',
  '2': 'info',
  '3': 'verbose',
  '4': 'debug',
  '5': 'silly',
};
const logColors = {
  error: 'bgRed',
  warn: 'bgYellow',
  info: 'bold',
  verbose: 'gray',
  debug: 'dim',
  silly: 'blue',
  timestamp: 'magenta',
  lando: 'cyan',
  app: 'green',
};
const userLevels = ['warn', 'error'];

// Maxsize
let fcw = 0;

// Rewriters
const keySanitizer = sanitizeKey => (level, msg, meta) => {
  _.forEach(meta, (value, key) => {
    if (sanitizeKey === key) meta[key] = '****';
  });
  return meta;
};


/**
 * Logs a debug message.
 *
 * Debug messages are intended to communicate lifecycle milestones and events that are relevant to developers
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
 * Errors are intended to communicate there is a serious problem with the application
 *
 * @since 3.0.0
 * @function
 * @name lando.log.error
 * @alias lando.log.error
 * @param {String} msg A string that will be passed into nodes core `utils.format()`
 * @param {...Any} [values] Values to be passed `utils.format()`
 * @example
 * // Log an error message
 * lando.log.error('This is an err with details %s', err);
 */
/**
 * Logs an info message.
 *
 * Info messages are intended to communicate lifecycle milestones and events that are relevant to users
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
 * Silly messages are meant for hardcore debugging
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
 * Verbose messages are intended to communicate extra information to the user and basics to a developer. They sit somewhere
 * inbetween info and debug
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
 * Warnings are intended to communicate you _might_ have a problem.
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
module.exports = class Log extends winston.Logger {
  constructor({logDir, logLevelConsole = 'warn', logLevel = 'debug', logName = 'lando'} = {}) {
    // If loglevelconsole is numeric lets map it!
    if (_.isInteger(logLevelConsole)) logLevelConsole = logLevels[logLevelConsole];

    // The default console transport
    const transports = [
      new winston.transports.Console({
        timestamp: () => dayjs().format('HH:mm:ss'),
        formatter: options => {
          // Get da prefixes
          const element = (logName === 'lando') ? 'lando' : logName;
          const elementColor = (logName === 'lando') ? 'lando' : 'app';
          // Set the leftmost colum width
          fcw = _.max([fcw, _.size(element)]);
          // Default output
          const output = [
            winston.config.colorize(elementColor, _.padEnd(element.toLowerCase(), fcw)),
            winston.config.colorize('timestamp', options.timestamp()),
            winston.config.colorize(options.level, options.level.toUpperCase()),
            '==>',
            util.format(options.message),
            serialize(options.meta),
          ];
          // If this is a warning or error and we arent verbose then omit prefixes
          if (_.includes(userLevels, options.level) && _.includes(userLevels, logLevelConsole)) {
            return _.drop(output, 2).join(' ');
          }
          return output.join(' ');
        },
        label: logName,
        level: logLevelConsole,
        colorize: true,
      }),
    ];

    // If we have a log path then let's add in some file transports
    if (logDir) {
      // Ensure the log dir actually exists
      mkdirp.sync(logDir);
      // Add in our generic and error logs
      transports.push(new winston.transports.File({
        name: 'error-file',
        label: logName,
        level: 'warn',
        maxSize: 500000,
        maxFiles: 2,
        filename: path.join(logDir, `${logName}-error.log`),
      }));
      transports.push(new winston.transports.File({
        name: 'log-file',
        label: logName,
        level: logLevel,
        maxSize: 500000,
        maxFiles: 3,
        filename: path.join(logDir, `${logName}.log`),
      }));
    }
    // Get the winston logger
    super({transports: transports, exitOnError: true, colors: logColors});

    // Extend with special lando things
    this.sanitizedKeys = ['auth', 'token', 'password', 'key', 'api_key', 'secret', 'machine_token'];
    // Loop through our sanitizedKeys and add sanitation
    _.forEach(this.sanitizedKeys, key => this.rewriters.push(keySanitizer(key)));
  };

  // Method to help other things add sanitizations
  alsoSanitize(key) {
    this.sanitizedKeys.push(key);
    this.rewriters.push(keySanitizer(key));
  };
};
