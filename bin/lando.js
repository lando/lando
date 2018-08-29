#!/usr/bin/env node

/**
 * Main CLI entrypoint to use the lando libraries
 * This file is meant to be linked as a "lando" executable.
 *
 * @name lando
 */

'use strict';

// Modules
const _ = require('lodash');
const bootstrap = require('./../lib/bootstrap.js');
const chalk = require('chalk');
const Cli = require('./../lib/cli');
const path = require('path');
const Promise = require('./../lib/promise');
const yargonaut = require('yargonaut');
yargonaut.style('green').errorsStyle('red');
const yargs = require('yargs');

// Allow envvars to override a few core things
let LOGLEVELCONSOLE = process.env.LANDO_CORE_LOGLEVELCONSOLE;
const ENVPREFIX = process.env.LANDO_CORE_ENVPREFIX;
const USERCONFROOT = process.env.LANDO_CORE_USERCONFROOT;

// If we have CLI verbosity args let's use those instead
const cli = new Cli(ENVPREFIX, LOGLEVELCONSOLE, USERCONFROOT);

// Handle error
let landoErrorHandler;
const handleError = (error, handler) => {
  error.verbose = cli.largv().verbose;
  process.exit(handler.handle(error));
};

// Kick off our bootstrap
bootstrap(cli.defaultConfig())

// Initialize the CLI
.then(lando => {
  // Bind to outside scope so we can use this in the catch
  // @TODO: do this better
  landoErrorHandler = lando.error;

  // Handle uncaught things
  _.forEach(['unhandledRejection', 'uncaughtException'], exception => {
    process.on(exception, error => handleError(error, lando.error));
  });

  // Get update info
  const currentVersion = lando.config.version;
  const latestUpdate = lando.cache.get('updates');
  const refreshData = lando.updates.fetch(latestUpdate);

  // Check our perms to start things off
  return Promise.try(cli.checkPerms)

  // Check for updates and inform user if we have some
  .then(() => {
    if (refreshData) {
      lando.log.verbose('Checking for updates...');
      return lando.updates.refresh(currentVersion)
      .then(latest => lando.cache.set('updates', latest, {persist: true}));
    }
  })

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
  .then(() => lando.events.emit('pre-cli-load', lando.tasks.tasks))

  // Print the CLI
  .then(() => {
    lando.log.info('Initializing cli');

    // Update warning
    if (lando.updates.updateAvailable(currentVersion, lando.cache.get('updates').version)) {
      console.log(lando.cli.makeArt('update', {paddingBottom: 0}));
      console.log(chalk.green(lando.cache.get('updates').url));
      console.log(' ');
    }

    // Start up the CLI
    const cmd = !_.has(process, 'pkg') ? '$0' : path.basename(_.get(process, 'execPath', 'lando'));
    yargs.usage(['Usage:', cmd, '<command> [args] [options] [-- global options]'].join(' '));

    // Loop through the tasks and add them to the CLI
    _.forEach(_.sortBy(lando.tasks.tasks, 'command'), task => {
      lando.log.verbose('Loading cli task %s', task.name);
      yargs.command(lando.cli.parseToYargs(task, lando.events));
    });

    // Invoke help if global option is specified
    if (cli.largv().help) {
      yargs.showHelp();
      process.exit(0);
    }

    // Create epilogue for our global options
    const epilogue = [
      lando.node.chalk.green('Global Options:\n'),
      '  --help, -h  Show help\n',
      '  --verbose, -v, -vv, -vvv, -vvvv  Change verbosity of output',
    ];

    // Finish up the yargs
    const argv = yargs
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
.catch(error => handleError(error, landoErrorHandler));
