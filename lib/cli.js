/**
 * Contains some CLI artwork and formatting helpers
 *
 * @since 3.0.0
 * @module cli
 * @example
 *
 * // Get the start header
 * return lando.cli.startHeader();
 */

'use strict';

// Modules
var _ = require('./node')._;
var chalk = require('./node').chalk;
var os = require('os');
var Table = require('cli-table');

/**
 * Returns a cheeky header that can be used after an app is started.
 *
 * @since 3.0.0
 * @returns {String} A header string we can print to the CLI
 * @example
 *
 * // Print the header to the console
 * console.log(lando.cli.startHeader());
 */
exports.startHeader = function() {

  // Collect the lines
  var lines = [];

  // Paint a picture
  lines.push('');
  lines.push(chalk.green('BOOMSHAKALAKA!!!'));
  lines.push('');
  lines.push('Your app has started up correctly.');
  lines.push('Here are some vitals:');
  lines.push('');

  // Return
  return lines.join(os.EOL);

};

/**
 * Returns a cheeky header that can be used after an app is init.
 *
 * @since 3.0.0
 * @returns {String} A header string we can print to the CLI
 * @example
 *
 * // Print the header to the console
 * console.log(lando.cli.initHeader());
 */
exports.initHeader = function() {

  // Collect the lines
  var lines = [];

  // Paint a picture
  lines.push('');
  lines.push(chalk.green('NOW WE\'RE COOKING WITH FIRE!!!'));
  lines.push('Your app has been initialized!');
  lines.push('');
  lines.push('Go to the directory where your app was initialized and run');
  lines.push('`lando start` to get rolling.');
  lines.push('');
  lines.push('Check the LOCATION printed below if you are unsure where to go.');
  lines.push('');
  lines.push('Here are some vitals:');
  lines.push('');

  // Return
  return lines.join(os.EOL);

};

/**
 * Returns a cheeky header that can be used after an app is shared
 *
 * @since 3.0.0
 * @returns {String} A header string we can print to the CLI
 * @example
 *
 * // Print the header to the console
 * console.log(lando.cli.tunnelHeader());
 */
exports.tunnelHeader = function() {

  // Collect the lines
  var lines = [];

  // Paint a picture
  lines.push('');
  lines.push(chalk.green('YOU ARE NOW SHARED WITH THE WORLD!!!'));
  lines.push('');
  lines.push('A local tunnel to your app has been established.');
  lines.push('');
  lines.push('Here is your public url:');

  // Return
  return lines.join(os.EOL);

};

/**
 * Utility function to help construct CLI displayable tables
 *
 * @since 3.0.0
 * @param {Object} [opts] - Options for how the table should be built
 * @param {String} [opts.arrayJoiner=', '] - A delimiter to be used when joining array data
 * @returns {Object} Table metadata that can be printed with toString()
 * @example
 *
 * // Grab a new cli table
 * var table = new lando.cli.Table();
 *
 * // Add data
 * table.add('NAME', app.name);
 * table.add('LOCATION', app.root);
 * table.add('SERVICES', _.keys(app.services));
 * table.add('URLS', urls, {arrayJoiner: '\n'});
 *
 * // Print the table
 * console.log(table.toString());
 */
exports.Table = function(opts) {

  // Default opts
  var tableDefaults = {
    chars: {
      'top': '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      'bottom': '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      'left': '',
      'left-mid': '',
      'mid': '',
      'mid-mid': '',
      'right': '',
      'right-mid': '',
      'middle': ''
    }
  };

  // Add a push method
  Table.prototype.add = function(key, value, opts) {

    // Set the default opts
    var addDefaults = {
      arrayJoiner: ', ',
    };

    // merge opts
    opts = _.merge(addDefaults, opts);

    // Colorize key
    key = chalk.cyan(key);

    // Do some special things for arrays
    if (_.isArray(value)) {
      value = value.join(opts.arrayJoiner);
    }

    // Do the normal push
    Table.prototype.push([key, value]);

  };

  // Return our default table
  return new Table(_.merge(tableDefaults, opts));

};
