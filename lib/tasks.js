/**
 * Contains some helpers to add and parse Lando tasks.
 *
 * Lando tasks are a high level abstraction that should contain the neded
 * information for both a GUI or CLI to present relevant UX to the user.
 *
 * @since 3.0.0
 * @module tasks
 * @example
 *
 * // Gets all the tasks that have been loaded
 * var task = lando.tasks.tasks;
 *
 * // Gets all the global options that have been specified.
 * var largv = lando.tasks.largv;
 *
 * // Load in two tasks during bootstrap
 * lando.events.on('post-bootstrap', 1, function(lando) {
 *
 *   // Load a task stored in a task module
 *   lando.tasks.add('config', require('./tasks/config')(lando));
 *
 *   // Load a task stored in an object called task
 *   lando.tasks.add('config', task);
 *
 * });
 *
 * // Add a task so it shows up as a command in the CLI
 * yargs.command(lando.tasks.parseToYargs(task));
 */

'use strict';

// Modules
var _ = require('./node')._;
var inquirer = require('inquirer');
var parse = require('yargs-parser');

/**
 * A singleton array that contains all the tasks that have been added.
 *
 * @since 3.0.0
 * @example
 *
 * // Gets all the tasks that have been loaded
 * var task = lando.tasks.tasks;
 */
exports.tasks = [];

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
 * Parses a lando task object into something that can be used by the [yargs](http://yargs.js.org/docs/) CLI.
 *
 * A lando task object is an abstraction on top of yargs that also contains some
 * metadata about how to interactively ask questions on both the CLI and GUI. While this
 * method is useful, any task added to Lando via `lando.tasks.add` will automatically
 * be parsed with this method.
 *
 * The interactivity metadata is light wrapper around [inquirer](https://github.com/sboudrias/Inquirer.js)
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
      question.name = question.name || name;
      question.weight = question.weight || 0;
      inquiry.push(question);
    }
  });

  // Build a handler that incorporates interactive options
  command.handler = function(argv) {

    // Get lando
    var lando = require('./lando')(require('./config'));
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
    return lando.events.emit(answersEvent, {argv: argv, inquirer: inquiry})

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
      return lando.events.emit(runEvent, truth)

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
 * Adds a Lando task to the global `lando.tasks.task` object.
 *
 * A lando task object is an abstraction on top of [yargs](http://yargs.js.org/docs/)
 * and [inquirer](https://github.com/sboudrias/Inquirer.js) with a little extra special sauce.
 *
 * @since 3.0.0
 * @see [yargs docs](http://yargs.js.org/docs/)
 * @see [inquirer docs](https://github.com/sboudrias/Inquirer.js)
 * @param {String} name - The name of the task.
 * @param {Object} task - A Lando task object
 * @param {String} task.command - A [yargs formatted command](http://yargs.js.org/docs/#methods-commandmodule-positional-arguments)
 * @param {String} task.description - A short description of the command
 * @param {Object} task.options - A [yargs builder object](http://yargs.js.org/docs/#methods-commandmodule). Each builder also has an 'interactive' key which is an [inquirier question object](https://github.com/sboudrias/Inquirer.js#objects)
 * @param {Function} task.run - The function to run when the task is invoked.
 * @param {Object} task.run.options - The options selected by the user, available to the run function.
 * @example
 *
 * // Define a task
 * var task = {
 *   command: 'destroy [appname]',
 *   describe: 'Destroy app in current directory or [appname]',
 *   options: {
 *     yes: {
 *       describe: 'Auto answer yes to prompts',
 *       alias: ['y'],
 *       default: false,
 *       boolean: true,
 *       interactive: {
 *         type: 'confirm',
 *         message: 'Are you sure you want to DESTROY?'
 *       }
 *     }
 *   },
 *   run: function(options) {
 *     console.log(options);
 *   }
 * };
 *
 * // Add the task to Lando
 * lando.tasks.add('destroy', task);
 */
exports.add = function(name, task) {

  // Build a task object
  var tasker = _.merge(task, {name: name});

  // Add to the task
  this.tasks.push(tasker);

};
