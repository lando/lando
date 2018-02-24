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
var bootstrap = require('./../lib/bootstrap.js');
var cli = require('./../lib/cli');
var log;
var metrics;
var os = require('os');
var path = require('path');
var Promise = require('./../lib/promise');
var sudoBlock = require('sudo-block');
var userConfRoot = path.join(os.homedir(), '.lando');
var version = require(path.join(__dirname, '..', 'package.json')).version;

// Allow envvars to override a few core things
var ENVPREFIX = process.env.LANDO_CORE_ENVPREFIX || 'LANDO_';
var LOGLEVELCONSOLE = process.env.LANDO_CORE_LOGLEVELCONSOLE || 'warn';
var USERCONFROOT = process.env.LANDO_CORE_USERCONFROOT || userConfRoot;

// If we have CLI verbosity args let's use those instead
if (cli.largv.verbose) { LOGLEVELCONSOLE = cli.largv.verbose + 1; }

// Define the start up options
var options = {
  configSources: [path.join(USERCONFROOT, 'config.yml')],
  envPrefix: ENVPREFIX,
  logLevelConsole: LOGLEVELCONSOLE,
  logDir: path.join(USERCONFROOT, 'logs'),
  mode: 'cli',
  pluginDirs: [USERCONFROOT],
  userConfRoot: USERCONFROOT,
  version: version
};

// Error handler
var handleError = function(error, log, metrics) {

  // Log error or not
  if (!error.hide) {
    log.error(error.message);
  }

  // Report error
  metrics.report('error', {message: error.message, stack: error.stack});

  // Exit this process
  process.exit(error.code || 1);

};

// Kick off our bootstrap
bootstrap(options)

// Initialize the CLI
.then(function(lando) {

  // Bind to outside scope
  // @TODO: do this better
  metrics = lando.metrics;
  log = lando.log;

  // Handle busted promises
  process.on('unhandledRejection', function(error) {
    handleError(error, lando.log, lando.metrics);
  });

  // And other uncaught things
  process.on('uncaughtException', function(error) {
    handleError(error, lando.log, lando.metrics);
  });

  // Log
  lando.log.info('Initializing cli');

  // Get CLI things
  var cmd = '$0';
  var tasks = _.sortBy(lando.tasks.tasks, 'name');
  var yargonaut = require('yargonaut');
  yargonaut.style('green').errorsStyle('red');
  var yargs = require('yargs');

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

  // Check for updates and inform user if we have some
  .then(function() {

    // Determine whether we need to refresh
    return Promise.resolve(lando.updates.fetch(lando.cache.get('updates')))

    // Fetch and cache if needed
    .then(function(fetch) {
      if (fetch) {
        lando.log.verbose('Checking for updates...');
        return lando.updates.refresh(lando.config.version)
        .then(function(latest) {
          lando.cache.set('updates', latest, {persist: true});
        });
      }
    })

    // Determin whether we should print a message or not
    .then(function() {
      var current = lando.config.version;
      var latest = lando.cache.get('updates');
      if (lando.updates.updateAvailable(current, latest.version)) {
        console.log(lando.cli.updateMessage(latest.url));
      }
    });

  })

  // Print the CLI
  .then(function() {

    // Loop through the tasks and add them to the CLI
    _.forEach(_.sortBy(tasks, 'command'), function(task) {
      lando.log.verbose('Loading cli task %s', task.name);
      yargs.command(lando.cli.parseToYargs(task, lando.events));
    });

    // Invoke help if global option is specified
    if (lando.cli.largv.help) {
      yargs.showHelp();
      process.exit(0);
    }

    // Create epilogue for our global options
    var epilogue = [
      lando.node.chalk.green('Global Options:\n'),
      '  --help, -h  Show help\n',
      '  --verbose, -v, -vv, -vvv, -vvvv  Change verbosity of output'
    ];

    // Finish up the yargs
    var argv = yargs
      .strict(true)
      .demandCommand(1, 'You need at least one command before moving on')
      .epilog(epilogue.join(''))
      .wrap(yargs.terminalWidth() * 0.75)
      .argv;

    // Log the CLI args
    lando.log.debug('CLI args', argv);

  });

})

// Handle all other errors
// @TODO: We need something better
.catch(function(error) {
  handleError(error, log, metrics);
});
