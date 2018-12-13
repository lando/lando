#!/usr/bin/env node

/**
 * Main CLI entrypoint to use the lando libraries
 * This file is meant to be linked as a "lando" executable.
 *
 * @name lando
 */

'use strict';

// Minimal modules we need to get the cli rolling
const fs = require('fs');
const path = require('path');
const Cli = require('./../lib/cli');

// Allow envvars to override a few core things
let LOGLEVELCONSOLE = process.env.LANDO_CORE_LOGLEVELCONSOLE;
const ENVPREFIX = process.env.LANDO_CORE_ENVPREFIX;
const USERCONFROOT = process.env.LANDO_CORE_USERCONFROOT;

// If we have CLI verbosity args let's use those instead
const cli = new Cli(ENVPREFIX, LOGLEVELCONSOLE, USERCONFROOT);
process.landoTaskCacheName = '_.tasks.cache';
const cacheTasksFile = path.join(cli.defaultConfig().userConfRoot, 'cache', process.landoTaskCacheName);

/*
 * Helper to parse tasks
 * NOTE: if this is being run we assume the existence of cacheTasksFile
 * @TODO: do we need some validation of the dumped tasks here?
 */
const getTasks = () => {
  return JSON.parse(JSON.parse(fs.readFileSync(cacheTasksFile, {encoding: 'utf-8'})));
};

// Ensure we aren't sudo-ing
cli.checkPerms();

// Print the cli if we've got tasks
if (fs.existsSync(cacheTasksFile)) {
  cli.run(getTasks());
// Min bootstrap lando so we can generate the task cache first
} else {
  // NOTE: we require lando down here because it adds .5 seconds if we do it above
  const Lando = require('./../lib/lando');
  const lando = new Lando(cli.defaultConfig());
  // Bootstrap lando
  // Dump the tasks cache
  // Parse the tasks
  // Show the cli
  lando.bootstrap().then(lando => {
    lando.cache.set(process.landoTaskCacheName, JSON.stringify(lando.tasks), {persist: true});
    cli.run(getTasks());
  });
}
