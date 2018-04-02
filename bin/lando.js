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
const cli = require('./../lib/cli');
const os = require('os');
const path = require('path');
const Promise = require('./../lib/promise');
const sudoBlock = require('sudo-block');
const userConfRoot = path.join(os.homedir(), '.lando');
const version = require(path.join(__dirname, '..', 'package.json')).version;

let log;
let metrics;
let LOGLEVELCONSOLE = process.env.LANDO_CORE_LOGLEVELCONSOLE || 'warn';

// Allow envvars to override a few core things
const ENVPREFIX = process.env.LANDO_CORE_ENVPREFIX || 'LANDO';
const USERCONFROOT = process.env.LANDO_CORE_USERCONFROOT || userConfRoot;

// If we have CLI verbosity args let's use those instead
if (cli.largv.verbose) { LOGLEVELCONSOLE = cli.largv.verbose + 1; }

// Define the start up options
const options = {
  configSources: [path.join(USERCONFROOT, 'config.yml')],
  envPrefix: ENVPREFIX,
  logLevelConsole: LOGLEVELCONSOLE,
  logDir: path.join(USERCONFROOT, 'logs'),
  mode: 'cli',
  pluginDirs: [USERCONFROOT],
  userConfRoot: USERCONFROOT,
  version
};

// Error handler
const handleError = ({hide, message, stack, code}, log, metrics) => {

  // Log error or not
  if (!hide) {
    log.error(message + stack);
  }

  // Report error
  metrics.report('error', {message: message, stack: stack});

  // Exit this process
  process.exit(code || 1);

};

// Kick off our bootstrap
bootstrap(options)

// Initialize the CLI
.then((lando) => {

  // Bind to outside scope
  // @TODO: do this better
  metrics = lando.metrics;
  log = lando.log;

  // Handle busted promises
  process.on('unhandledRejection', (error) => {
    handleError(error, lando.log, lando.metrics);
  });

  // And other uncaught things
  process.on('uncaughtException', (error) => {
    handleError(error, lando.log, lando.metrics);
  });

  // Log
  lando.log.info('Initializing cli');

  // Get CLI things
  let cmd = '$0';

  // And other things
  const tasks = _.sortBy(lando.tasks.tasks, 'name');
  const yargonaut = require('yargonaut');
  yargonaut.style('green').errorsStyle('red');
  const yargs = require('yargs');

  // If we are packaged lets get something else for the cmd path
  if (_.has(process, 'pkg')) {
    cmd = path.basename(_.get(process, 'execPath', 'lando'));
  }

  // Define our usage syntax
  const syntax = '<command> [args] [options] [-- global options]';
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
  .then(() => {
    sudoBlock(lando.node.chalk.red('Lando should never be run as root!'));
  })

  // Check for updates and inform user if we have some
  .then(() => Promise.resolve(lando.updates.fetch(lando.cache.get('updates')))

  // Fetch and cache if needed
  .then((fetch) => {
    if (fetch) {
      lando.log.verbose('Checking for updates...');
      return lando.updates.refresh(lando.config.version)
      .then((latest) => {
        lando.cache.set('updates', latest, {persist: true});
      });
    }
  })

  // Determin whether we should print a message or not
  .then(() => {
    const current = lando.config.version;
    const latest = lando.cache.get('updates');
    if (lando.updates.updateAvailable(current, latest.version)) {
      console.log(lando.cli.updateMessage(latest.url));
    }
  }))

  // Print the CLI
  .then(() => {

    // Loop through the tasks and add them to the CLI
    _.forEach(_.sortBy(tasks, 'command'), (task) => {
      lando.log.verbose('Loading cli task %s', task.name);
      yargs.command(lando.cli.parseToYargs(task, lando.events));
    });

    // Invoke help if global option is specified
    if (lando.cli.largv.help) {
      yargs.showHelp();
      process.exit(0);
    }

    // Create epilogue for our global options
    const epilogue = [
      lando.node.chalk.green('Global Options:\n'),
      '  --help, -h  Show help\n',
      '  --verbose, -v, -vv, -vvv, -vvvv  Change verbosity of output'
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
// @TODO: We need something better
.catch((error) => {
  handleError(error, log, metrics);
});
