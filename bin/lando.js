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
const bootstrap = require('./../lib/bootstrap');
const path = require('path');

// Allow envvars to override a few core things
const LOGLEVELCONSOLE = process.env.LANDO_CORE_LOGLEVELCONSOLE;
const ENVPREFIX = process.env.LANDO_CORE_ENVPREFIX;
const USERCONFROOT = process.env.LANDO_CORE_USERCONFROOT;

// Summon the CLI
const Cli = require('./../lib/cli');
const cli = new Cli(ENVPREFIX, LOGLEVELCONSOLE, USERCONFROOT);

// Get an array of the lando files we need to load in
const landoFile = cli.defaultConfig().landoFile;
const preLandoFiles = cli.defaultConfig().preLandoFiles;
const postLandoFiles = cli.defaultConfig().postLandoFiles;
const landoFiles = bootstrap.getLandoFiles(_.flatten([preLandoFiles, [landoFile], postLandoFiles], process.cwd()));
const config = (!_.isEmpty(landoFiles)) ? bootstrap.getApp(landoFiles, cli.defaultConfig().userConfRoot) : {};
const bsLevel = (_.has(config, 'recipe')) ? 'APP' : 'TASKS';

// Lando cache stuffs
process.lando = 'node';
process.landoTaskCacheName = '_.tasks.cache';
process.landoTaskCacheFile = path.join(cli.defaultConfig().userConfRoot, 'cache', process.landoTaskCacheName);
process.landoAppTaskCacheFile = !_.isEmpty(config) ? config.toolingCache : undefined;

// Check for sudo usage
cli.checkPerms();

// Check to see if we have a recipe and if it doesn't have a tooling cache lets enforce a manual cache clear
if (bsLevel === 'APP' && !fs.existsSync(config.toolingCache)) {
  if (fs.existsSync(process.landoTaskCacheFile)) fs.unlinkSync(process.landoTaskCacheFile);
}

// Print the cli if we've got tasks cached
if (fs.existsSync(process.landoTaskCacheFile)) {
  cli.run(bootstrap.getTasks(config, cli.argv()), config);
// Otherwise min bootstrap lando so we can generate the task cache first
} else {
  // NOTE: we require lando down here because it adds .5 seconds if we do it above
  const Lando = require('./../lib/lando');
  const lando = new Lando(cli.defaultConfig());
  // Bootstrap lando at the correct level
  lando.bootstrap(bsLevel).then(lando => {
    // If bootstrap level is APP then we need to get and init our app to generate the app task cache
    if (bsLevel === 'APP') {
      lando.getApp().init().then(() => cli.run(bootstrap.getTasks(config, cli.argv()), config));
    // Otherwise run as yooz
    } else {
      cli.run(bootstrap.getTasks(config, cli.argv()), config);
    }
  });
}
