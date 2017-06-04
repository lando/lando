/**
 * Things Things Things Things Things Things Things Things Things Things
 * Things Things Things Things Things Things
 * Things Things Things Things Things Things Things Things
 * Things Things Things Things Things Things
 *
 * @namespace tasks
 */

'use strict';

// Modules
var _ = require('./node')._;
var inquirer = require('inquirer');
var parse = require('yargs-parser');

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

/*
 * Take a task and return a yarg command module
 */
exports.parseToYargs = function(task) {

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
 * Add a task.
 *
 * Either to the global task object or the passed in object
 */
exports.add = function(name, task, object) {

  // Add to passed in object if applicable
  if (object) {
    object.tasks[name] = task;
  }

  // Add to global task object otherwise
  else {
    this.tasks[name] = task;
  }

};
