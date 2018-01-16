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
var cli = require('./../lib/cli');
var os = require('os');
var path = require('path');

// Grab the bootstrap func
var bootstrap = require('./../lib/bootstrap.js');

// Allow envvars to override a few core things
var userConfRoot = path.join(os.homedir(), '.lando');
var ENVPREFIX = process.env.LANDO_CORE_ENVPREFIX || 'LANDO_';
var LOGLEVELCONSOLE = process.env.LANDO_CORE_LOGLEVELCONSOLE || 'warn';
var USERCONFROOT = process.env.LANDO_CORE_USERCONFROOT || userConfRoot;

// If we have CLI verbosity args let's use those instead
if (cli.largv.verbose) {
  LOGLEVELCONSOLE = cli.largv.verbose + 1;
}

// Initialize Lando with some start up config
bootstrap({
  configSources: [path.join(USERCONFROOT, 'config.yml')],
  envPrefix: ENVPREFIX,
  logLevelConsole: LOGLEVELCONSOLE,
  logDir: path.join(USERCONFROOT, 'logs'),
  mode: 'cli',
  pluginDirs: [USERCONFROOT],
  userConfRoot: USERCONFROOT
})

/*
 * Initializes the CLI.
 *
 * This will either print the CLI usage to the console or route the command and
 * options given by the user to the correct place.
 */
.then(function(lando) {

  // Yargonaut must come before yargs
  var sudoBlock = require('sudo-block');
  var yargonaut = require('yargonaut');
  yargonaut.style('green').errorsStyle('red');

  // Get yargs
  var yargs = require('yargs');

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

    // Create epilogue for our global options
    var epilogue = [
      lando.node.chalk.green('Global Options:\n'),
      '  --help, -h  Show help\n',
      '  --verbose, -v, -vv, -vvv, -vvvv  Change verbosity of output'
    ];

    // Loop through the tasks and add them to the CLI
    _.forEach(tasks, function(task) {
      lando.log.verbose('Loading cli task %s', task.name);
      yargs.command(lando.cli.parseToYargs(task));
    });

    // Invoke help if global option is specified
    if (lando.cli.largv.help) {
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
