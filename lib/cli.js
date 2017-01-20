/**
 * CLI module.
 *
 * @name cli
 */

'use strict';

// Modules
var _ = require('./node')._;
var chalk = require('./node').chalk;
var inquirer = require('inquirer');
var os = require('os');
var Table = require('cli-table');

// Yargonaut must come before yargs
var yargonaut = require('yargonaut');
yargonaut.style('green').errorsStyle('red');

// Get yargs
var yargs = require('yargs');

/*
 * Take a task and return a yarg command module
 */
var parseToYargs = function(task) {

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
      question.name = name;
      inquiry.push(question);
    }
  });

  // Build a handler that incorporates interactive options
  command.handler = function(argv) {

    // Attempt to filter out questions that have already been answers
    var questions = _.filter(inquiry, function(option) {
      return argv[option.name] === false;
    });

    // Prompt the use for feedback if needed
    return inquirer.prompt(questions)

    // Merge data from our interfaces and provide to the task runner
    .then(function(answers) {
      return task.run(_.merge(argv, answers));
    });

  };

  // Return the completed object
  return command;

};

/*
 * Basic start header
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
 * Create a new CLI table
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
 * Initialize the CLI
 */
exports.init = function(lando) {

  // Get global tasks
  var tasks = lando.tasks.tasks;

  // Define our default CLI
  yargs.usage('Usage: $0 <command> [args] [options] [-- global options]');

  // Let the CLI edit some tasks
  return lando.events.emit('pre-cli-load', tasks)

  // Print our result
  .then(function() {

    // Create epilogue for our global options
    var epilogue = [
      chalk.green('Global Options:\n'),
      '  --verbose, -v, -vv, -vvv, -vvvv  verbosity of output'
    ];

    // Loop through the tasks and add them to the CLI
    _.forEach(tasks, function(task, name) {
      lando.log.verbose('Loading cli task %s', name);
      yargs.command(parseToYargs(task));
    });

    // Finish up the yargs
    var argv = yargs
      .help('help')
      .alias('help', ['h'])
      .demandCommand(1, 'You need at least one command before moving on')
      .epilog(epilogue.join(''))
      .argv;

    // Log the CLI
    lando.log.info('CLI initialized');
    lando.log.debug('CLI args', argv);

  });

};
