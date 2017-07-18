/**
 * Contains methods to help initialize and display the CLI
 *
 * @since 3.0.0
 * @module cli
 * @example
 *
 * // Initialize CLI
 * return lando.cli.init(lando);
 */

'use strict';

// Modules
var _ = require('./node')._;
var chalk = require('./node').chalk;
var os = require('os');
var parse = require('yargs-parser');
var path = require('path');
var Table = require('cli-table');

// Yargonaut must come before yargs
var yargonaut = require('yargonaut');
yargonaut.style('green').errorsStyle('red');

// Get yargs
var yargs = require('yargs');

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
 * console.log(lando.cli.startHeader());
 */
exports.initHeader = function() {

  // Collect the lines
  var lines = [];

  // Paint a picture
  lines.push('');
  lines.push(chalk.green('NOW WE\'RE COOKING WITH FIRE!!!'));
  lines.push('');
  lines.push('Your app has been initialized.');
  lines.push('Not try running `lando start` to get rolling.');
  lines.push('');
  lines.push('Here are some vitals:');
  lines.push('');

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

/**
 * Initializes the CLI.
 *
 * This will either print the CLI usage to the console or route the command and
 * options given by the user to the correct place.
 *
 * @since 3.0.0
 * @fires pre-cli-load
 * @param {Object} lando - An initialized lando object.
 * @example
 *
 * // Initialize the CLI
 * return lando.cli.init(lando);
 */
exports.init = function(lando) {

  // Log
  lando.log.info('Initializing cli');

  // Get global tasks
  var tasks = _.sortBy(lando.tasks.tasks, 'name');

  // Get cmd
  var cmd = '$0';

  // If we are packaged lets get something else
  if (_.has(process, 'pkg')) {
    cmd = path.basename(_.get(process, 'execPath', 'lando'));
  }

  // Define our default CLI
  yargs
    .usage('Usage: ' + cmd + ' <command> [args] [options] [-- global options]');

  /**
   * Event that allows other things to alter the tasks being loaded to the CLI.
   *
   * @since 3.0.0
   * @event module:cli.event:pre-cli-load
   * @property {Object} tasks An object of Lando tasks
   * @example
   *
   * // As a joke remove all tasks and give us a blank CLI
   * lando.events.on('pre-cli-load', function(tasks) {
   *   tasks = {};
   * });
   */
  return lando.events.emit('pre-cli-load', tasks)

  // Print our result
  .then(function() {

    // Parse any global opts for usage later
    tasks.largv = (parse(parse(process.argv.slice(2))._, {
      alias: {'verbose': ['v'], 'help': ['h']},
      count: ['v']
    }));

    // Create epilogue for our global options
    var epilogue = [
      chalk.green('Global Options:\n'),
      '  --help, -h  Show help\n',
      '  --verbose, -v, -vv, -vvv, -vvvv  Change verbosity of output'
    ];

    // Loop through the tasks and add them to the CLI
    _.forEach(tasks, function(task) {
      lando.log.verbose('Loading cli task %s', task.name);
      yargs.command(lando.tasks.parseToYargs(task));
    });

    // Invoke help if global option is specified
    if (tasks.largv.help) {
      yargs.showHelp();
      process.exit(0);
    }

    // Finish up the yargs
    var argv = yargs
      .demandCommand(1, 'You need at least one command before moving on')
      .epilog(epilogue.join(''))
      .wrap(yargs.terminalWidth() * 0.75)
      .argv;

    // Log the CLI
    lando.log.debug('CLI args', argv);

  });

};
