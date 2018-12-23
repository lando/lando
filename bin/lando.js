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
const traverseUp = require('./../lib/traverse');
const yaml = require('js-yaml');

//
// HELPERS
//

/*
 * Helper to run the app task runner
 */
const appRunner = command => (argv, lando) => {
  const app = lando.getApp(path.resolve(process.cwd(), landoFile));
  return app.init().then(() => _.find(app.tasks, {command}).run(argv));
};

/*
 * Helper to return the engine task runner
 */
const engineRunner = (config, command) => (argv, lando) => {
  const AsyncEvents = require('./../lib/events');
  // Build a minimal app
  const app = lando.cache.get(path.basename(config.composeCache));
  app.config = config;
  app.events = new AsyncEvents(lando.log);
  // Load only what we need so we dont pay the appinit penalty
  const utils = require('./../plugins/lando-tooling/lib/utils');
  const buildTask = require('./../plugins/lando-tooling/lib/build');
  require('./../plugins/lando-events/app')(app, lando);
  app.config.tooling = utils.getToolingTasks(app.config.tooling, app);
  // Load and run
  return buildTask(_.find(app.config.tooling, task => task.name === command), lando).run(argv);
};

/*
 * Helper to load a very basic app
 */
const getApp = (file, userConfRoot) => {
  const config = loadLandoFile(file);
  return _.merge({}, config, {
    configFile: file,
    project: _.toLower(config.name).replace(/_|-|\.+/g, ''),
    root: path.dirname(file),
    composeCache: path.join(userConfRoot, 'cache', `${config.name}.compose.cache`),
    toolingCache: path.join(userConfRoot, 'cache', `${config.name}.tooling.cache`),
  });
};

/*
 * Helper to determine bootstrap level
 */
const getBsLevel = (config, command) => (!fs.existsSync(config.composeCache)) ? 'app' : 'engine';

/*
 * Helper to parse tasks
 * @NOTE: if this is being run we assume the existence of cacheTasksFile
 * @NOTE: i guess we are not really factoring in whether lando-tooling is disabled or not?
 * @TODO: do we need some validation of the dumped tasks here?
 */
const getTasks = (config = {}, tasks = []) => {
  // If we have a recipe lets rebase on that
  if (_.has(config, 'recipe')) config.tooling = _.merge({}, loadCacheFile(config.toolingCache), config.tooling);
  // If the tooling command is being called lets assess whether we can get away with engine bootstrap level
  const level = (_.includes(_.keys(config.tooling), cli.argv()._[0])) ? getBsLevel(config, cli.argv()._[0]) : 'app';
  // Load all the tasks
  _.forEach(_.get(config, 'tooling', {}), (task, command) => {
    tasks.push({
      command,
      level,
      describe: _.get(task, 'description', `Run ${command} commands`),
      options: _.get(task, 'options', {}),
      run: (level === 'app') ? appRunner(command) : engineRunner(config, command),
    });
  });
  return tasks.concat(loadCacheFile(process.landoTaskCacheFile));
};

/*
 * Helper to load cached file without cache module
 */
const loadCacheFile = file => {
  try {
    return JSON.parse(JSON.parse(fs.readFileSync(file, {encoding: 'utf-8'})));
  } catch (e) {
    throw new Error(`There was a problem with parsing ${file}. Ensure it is valid JSON! ${e}`);
  }
};

/*
 * Helper to load landofile
 */
const loadLandoFile = file => {
  try {
    return yaml.safeLoad(fs.readFileSync(file));
  } catch (e) {
    throw new Error(`There was a problem with parsing ${file}. Ensure it is valid YAML! ${e}`);
  }
};

//
// MAIN PROGRAM LOGIX
//

// Allow envvars to override a few core things
const LOGLEVELCONSOLE = process.env.LANDO_CORE_LOGLEVELCONSOLE;
const ENVPREFIX = process.env.LANDO_CORE_ENVPREFIX;
const USERCONFROOT = process.env.LANDO_CORE_USERCONFROOT;

// Summon the CLI
const Cli = require('./../lib/cli');
const cli = new Cli(ENVPREFIX, LOGLEVELCONSOLE, USERCONFROOT);

// See if we have a lando file and if we do lets load the config
const starter = path.resolve(process.cwd(), cli.defaultConfig().landoFile);
const landoFile = _.find(traverseUp(starter), file => fs.existsSync(file));
const config = (landoFile) ? getApp(landoFile, cli.defaultConfig().userConfRoot) : {};
const bsLevel = (_.has(config, 'recipe')) ? 'APP' : 'TASKS';

// Lando cache stuffs
process.lando = 'node';
process.landoTaskCacheName = '_.tasks.cache';
process.landoTaskCacheFile = path.join(cli.defaultConfig().userConfRoot, 'cache', process.landoTaskCacheName);
process.landoAppTaskCacheFile = !_.isEmpty(config) ? config.toolingCache : undefined;

// Check for sudo usage
cli.checkPerms();

// Check to see if we have a recipe and if it doesnt have a tooling cache lets enforce a manual cache clear
if (bsLevel === 'APP' && !fs.existsSync(config.toolingCache)) {
  if (fs.existsSync(process.landoTaskCacheFile)) fs.unlinkSync(process.landoTaskCacheFile);
}

// Print the cli if we've got tasks cached
if (fs.existsSync(process.landoTaskCacheFile)) {
  cli.run(getTasks(config));
// Otherwise min bootstrap lando so we can generate the task cache first
} else {
  // NOTE: we require lando down here because it adds .5 seconds if we do it above
  const Lando = require('./../lib/lando');
  const lando = new Lando(cli.defaultConfig());
  // Bootstrap lando at the correct level
  lando.bootstrap(bsLevel).then(lando => {
    // If bootstrap level is APP then we need to get and init our app to generate the app task cache
    if (bsLevel === 'APP') lando.getApp(landoFile).init().then(() => cli.run(getTasks(config)));
    // Otherwise run as yooz
    else cli.run(getTasks(config));
  });
}
