#!/usr/bin/env node

/**
 * Main CLI entrypoint to use the lando libraries
 * This file is meant to be linked as a "lando" executable.
 *
 * @NOTE: We are duplicating a lot of code here because its less expensive than requiring our lando libs and
 * the users have a need for speed
 *
 * @name lando
 */

'use strict';

// Minimal modules we need to get the cli rolling
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Cli = require('./../lib/cli');
const yaml = require('js-yaml');


// Allow envvars to override a few core things
let LOGLEVELCONSOLE = process.env.LANDO_CORE_LOGLEVELCONSOLE;
const ENVPREFIX = process.env.LANDO_CORE_ENVPREFIX;
const USERCONFROOT = process.env.LANDO_CORE_USERCONFROOT;

// If we have CLI verbosity args let's use those instead
const cli = new Cli(ENVPREFIX, LOGLEVELCONSOLE, USERCONFROOT);

// Process mod
process.lando = 'node';
process.landoTaskCacheName = '_.tasks.cache';
process.landoTaskCacheFile = path.join(cli.defaultConfig().userConfRoot, 'cache', process.landoTaskCacheName);

/*
 * Load landofile
 */
const load = file => {
  try {
    return yaml.safeLoad(fs.readFileSync(file));
  } catch (e) {
    throw new Error(`There was a problem with parsing ${file}. Ensure it is valid yaml! ${e}`);
  }
};

/*
 * Helper to traverse up directories from a start point
 */
const traverseUp = file => _(_.range(path.dirname(file).split(path.sep).length))
  .map(end => _.dropRight(path.dirname(file).split(path.sep), end).join(path.sep))
  .map(dir => path.join(dir, path.basename(file)))
  .value();

/*
 * Helper to parse tasks
 * @NOTE: if this is being run we assume the existence of cacheTasksFile
 * @NOTE: i guess we are not really factoring in whether lando-tooling is disabled or not?
 * @TODO: do we need some validation of the dumped tasks here?
 */
const getTasks = (tasks = []) => {
  // Check to see if we got a landofile and load up some app config if we do
  const starter = path.resolve(process.cwd(), cli.defaultConfig().landoFile);
  const landoFile = _.find(traverseUp(starter), file => fs.existsSync(file));
  // If we do lets try
  if (landoFile) {
    const app = load(landoFile);
    if (_.has(app, 'tooling')) {
      _.forEach(app.tooling, (task, command) => {
        tasks.push({
          command,
          describe: _.get(task, 'description', `Run ${command} commands`),
          options: _.get(task, 'options', {}),
        });
      });
    }
  }
  // Add in our cached tasks
  return tasks.concat(JSON.parse(JSON.parse(fs.readFileSync(process.landoTaskCacheFile, {encoding: 'utf-8'}))));
};

//
// MAIN PROGRAM LOGIX
//
cli.checkPerms();

// Print the cli if we've got tasks
if (fs.existsSync(process.landoTaskCacheFile)) {
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
