/**
 * Tasks module.
 *
 * @name tasks
 */

'use strict';

// Modules
var _ = require('./node')._;
var chalk = require('./node').chalk;
var inquirer = require('inquirer');
var parse = require('yargs-parser');

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

/**
 * Place to store global tasks
 */
exports.tasks = {};

/**
 * Get global lando verbose arg
 */
exports.largv = parse(parse(process.argv.slice(2))._, {
  alias: {'verbose': ['v'], 'help': ['h']},
  count: ['v']
});

/**
 * Add a task.
 *
 * Either to the global task object or the passed in object
 */
exports.addTask = function(name, task, object) {

  // Add to passed in object if applicable
  if (object) {
    object.tasks[name] = task;
  }

  // Add to global task object otherwise
  else {
    this.tasks[name] = task;
  }

};

/**
 * Initialize the CLI
 */
exports.cli = function(lando) {

  // Get global tasks
  var tasks = this.tasks;

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
