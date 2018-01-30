/**
 * Contains some CLI artwork and helpers
 *
 * @since 3.0.0
 * @module cli
 * @example
 *
 * // Gets all the global options that have been specified.
 * var largv = lando.tasks.largv;
 *
 * // Get the start header
 * return lando.cli.startHeader();
 *
 * // Add a task so it shows up as a command in the CLI
 * yargs.command(lando.tasks.parseToYargs(task));
 *
 */

'use strict';

// Modules
var _ = require('lodash')._;
var chalk = require('./node').chalk;
var inquirer = require('inquirer');
var os = require('os');
var parse = require('yargs-parser');
var Table = require('cli-table');

/**
 * Returns the lando options
 *
 * This means all the options passed in before the `--` flag.
 *
 * @since 3.0.0
 * @example
 *
 * // Gets all the global options that have been specified.
 * var argv = lando.tasks.argv;
 */
exports.argv = function() {
  return require('yargs').argv;
};

/**
 * Helper function to parse global opts
 *
 * @since 3.0.0
 * @see https://github.com/lando/lando/issues/351
 * @example
 *
 * // Gets all the tasks that have been loaded
 * var largv = lando.tasks.parseGlobals();
 */
exports.parseGlobals = function() {

  // Get our raw
  var rawArgs = process.argv.slice(2);
  var globz = parse(rawArgs);

  // The first parsing
  // Check if we have _. and then filter by -
  if (!_.isEmpty(globz._)) {
    globz = _.filter(globz._, function(value) {
      return _.startsWith(value, '-');
    });
  }
  else {
    globz = [];
  }

  // Return the globalz
  return parse(globz, {
    alias: {'verbose': ['v'], 'help': ['h']},
    count: ['v']
  });

};

/**
 * A singleton object that contains the Lando global options.
 *
 * This means all the options passed in after the `--` flag.
 *
 * @since 3.0.0
 * @example
 *
 * // Gets all the global options that have been specified.
 * var largv = lando.tasks.largv;
 */
exports.largv = this.parseGlobals();

/**
 * Parses a lando task object into something that can be used by the [yargs](http://yargs.js.org/docs/) CLI.
 *
 * A lando task object is an abstraction on top of yargs that also contains some
 * metadata about how to interactively ask questions on both the CLI and GUI. While this
 * method is useful, any task added to Lando via `lando.tasks.add` will automatically
 * be parsed with this method.
 *
 * The interactivity metadata is light wrapper around [inquirer](https://github.com/sboudrias/Inquirer.js)
 *
 * @TODO: Injecting the events here seems not the way we want to go?
 *
 * @since 3.0.0
 * @see [yargs docs](http://yargs.js.org/docs/)
 * @see [inquirer docs](https://github.com/sboudrias/Inquirer.js)
 * @param {Object} task - A Lando task object (@see add for definition)
 * @returns {Object} A yargs command object
 * @example
 *
 * // Add that task to the CLI
 * yargs.command(lando.tasks.parseToYargs(task));
 */
exports.parseToYargs = function(task, events) {

  // Start command and option collectors
  var command = {};
  var inquiry = [];

  // Grab the basics
  command.command = task.command;
  command.describe = task.describe;

  // Add our options to the builder
  command.builder = task.options || {};

  // Translate options to inquiry
  _.forEach(command.builder, function(option, name) {
    if (option && option.interactive) {
      var question = option.interactive;
      question.name = question.name || name;
      question.weight = question.weight || 0;
      inquiry.push(question);
    }
  });

  // Build a handler that incorporates interactive options
  command.handler = function(argv) {

    // Build commands
    var cmd = argv._[0];
    var answersEvent = ['task', cmd, 'answers'].join('-');
    var runEvent = ['task', cmd, 'run'].join('-');

    /**
     * Event that allows altering of argv or inquirer before interactive prompts
     * are run
     *
     * @since 3.0.0
     * @event module:tasks.event:task-CMD-answers
     * @property {Object} answers argv and inquirer questions
     */
    return events.emit(answersEvent, {argv: argv, inquirer: inquiry})

    // Do the filtering
    .then(function() {

      // Attempt to filter out questions that have already been answered
      var questions = _.filter(inquiry, function(option) {
        return (_.isNil(argv[option.name]) || argv[option.name] === false);
      });

      // Prompt the use for feedback if needed and sort by weight
      return inquirer.prompt(_.sortBy(questions, 'weight'));

    })

    // Merge data from our interfaces and provide to the task runner
    .then(function(answers) {

      // Merge it all together
      var truth = _.merge(argv, answers);

      /**
       * Event that allows final altering of answers
       *
       * @since 3.0.0
       * @event module:tasks.event:task-CMD-run
       * @property {Object} answers object
       */
      return events.emit(runEvent, truth)

      // Run the task
      .then(function() {
        return task.run(truth);
      });

    });

  };

  // Return the completed object
  return command;

};


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
 * Returns a mesage indicating the availability of an update
 *
 * @since 3.0.0
 * @param {String} url - The URL with the link to the update
 * @returns {String} An update message we can print to the CLI
 * @example
 *
 * // Print the header to the console
 * console.log(lando.cli.tunnelHeader());
 */
exports.updateMessage = function(url) {

  // Collect the lines
  var lines = [];

  // Paint a picture
  lines.push('');
  lines.push(chalk.yellow('There is an update available!!!'));
  lines.push(chalk.yellow('Install it to get the latest and greatest'));
  lines.push('');
  lines.push('Updating helps us provide the best support.');
  lines.push(chalk.green(url));
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
