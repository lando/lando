#!/usr/bin/env node

/**
 * Main CLI entrypoint to use the lando libraries
 * This file is meant to be linked as a "lando" executable.
 *
 * @name lando
 */

'use strict';

// Modules
var _ = require('lodash');
var chalk = require('chalk');
var path = require('path');
var sudoBlock = require('sudo-block');

// Yargonaut must come before yargs
var yargonaut = require('yargonaut');
yargonaut.style('green').errorsStyle('red');

// Get yargs
var yargs = require('yargs');

// Grab the bootstrap func
var bootstrap = require('./../lib/bootstrap.js');

// @TODO:
// Set a more complicated config here with the relevant LANDO thingss eg sys confRoot etc

// @TODO:
// Grab verbose mode counter so we can override the defualt logLevelConsole


/*
 * Get our log level
 */
/*
var getLogLevelConsole = function() {

  // If we are in the GUI then assume the higest level here
  if (config.mode === 'gui') {
    return 'debug';
  }

  // Otherwise get the log level from the args
  var cliLevel = tasks.largv.verbose + 1 || 0;

  // Get the log level from the config
  var confLevel = getLogLevel(config.logLevelConsole) || 0;

  // Get the max log level between the two
  var maxLog = _.max([cliLevel, confLevel]);

  // Use MAX cli or conf or warn by default
  return logLevels[maxLog] || 'warn';

};
*/

// Initialize Lando
bootstrap({mode: 'cli'})

/*
 * Initializes the CLI.
 *
 * This will either print the CLI usage to the console or route the command and
 * options given by the user to the correct place.
 */
.then(function(lando) {

  // Log
  lando.log.info('Initializing cli');

  // Get global tasks
  var tasks = _.sortBy(lando.tasks.tasks, 'name');

  // Get cmd
  var cmd = '$0';

  // If we are packaged lets get something else for the cmd path
  if (_.has(process, 'pkg')) {
    cmd = path.basename(_.get(process, 'execPath', 'lando'));
  }

  // Define our usage syntax
  var syntax = '<command> [args] [options] [-- global options]';
  yargs.usage(['Usage:', cmd, syntax].join(' '));

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

  // No sudo!
  .then(function() {
    sudoBlock(lando.node.chalk.red('Lando should never be run as root!'));
  })

  // Print our result
  .then(function() {

    // Parse any global opts for usage later
    tasks.largv = lando.tasks.parseGlobals();

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
      .strict(true)
      .demandCommand(1, 'You need at least one command before moving on')
      .epilog(epilogue.join(''))
      .wrap(yargs.terminalWidth() * 0.75)
      .argv;

    // Log the CLI
    lando.log.debug('CLI args', argv);

  });

})

// Handle uncaught errors
// @TODO: this doesn't seem altogether correct
.catch(function(error) {
  throw new Error(error);
});
