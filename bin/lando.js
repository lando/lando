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
const yaml = require('js-yaml');

/*
 * Helper to run the tasks
 */
const appRunner = command => (argv, lando) => {
  const app = lando.getApp(path.resolve(process.cwd(), landoFile));
  return app.init().then(() => _.find(app.tasks, {command}).run(argv));
};

/*
 * Helper to return the tooling task runner
 */
const engineRunner = (config, command) => (argv, lando) => {
  const AsyncEvents = require('./../lib/events');
  // Build a minimal app
  const app = lando.cache.get(path.basename(config.toolingCache));
  app.config = config;
  app.events = new AsyncEvents(lando.log);
  // Load only what we need so we dont pay the appinit penalty
  const utils = require('./../plugins/lando-tooling/lib/utils');
  require('./../plugins/lando-events/app')(app, lando);
  // Load and run
  return utils.buildTask(_.merge({}, _.find(config.tooling, (value, key) => key === command), {app}), lando).run(argv);
};

/*
 * Helper to load a very basic app
 */
const getApp = (file, userConfRoot) => {
  const config = load(file);
  return _.merge({}, config, {
    configFile: file,
    project: _.toLower(config.name).replace(/_|-|\.+/g, ''),
    root: path.dirname(file),
    toolingCache: path.join(userConfRoot, 'cache', `${config.name}.tooling.cache`),
  });
};

/*
 * Helper to determine bootstrap level
 */
const getBsLevel = (config, command) => (!fs.existsSync(config.toolingCache)) ? 'app' : 'engine';

/*
 * Helper to parse tasks
 * @NOTE: if this is being run we assume the existence of cacheTasksFile
 * @NOTE: i guess we are not really factoring in whether lando-tooling is disabled or not?
 * @TODO: do we need some validation of the dumped tasks here?
 */
const getTasks = (tooling = [], level = 'app', config = {}, tasks = []) => {
  _.forEach(tooling, (task, command) => {
    tasks.push({
      command,
      level,
      describe: _.get(task, 'description', `Run ${command} commands`),
      options: _.get(task, 'options', {}),
      run: (level === 'app') ? appRunner(command) : engineRunner(config, command),
    });
  });
  return tasks.concat(JSON.parse(JSON.parse(fs.readFileSync(process.landoTaskCacheFile, {encoding: 'utf-8'}))));
};

/*
 * Helper to load landofile
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
const tooling = _.get(config, 'tooling', []);

// Lando cache
process.lando = 'node';
process.landoTaskCacheName = '_.tasks.cache';
process.landoTaskCacheFile = path.join(cli.defaultConfig().userConfRoot, 'cache', process.landoTaskCacheName);

// If the tooling command is being called lets assess whether we can get away with engine bootstrap level
const toolingLevel = (_.includes(_.keys(tooling), cli.argv()._[0])) ? getBsLevel(config, cli.argv()._[0]) : 'app';

//
// MAIN PROGRAM LOGIX
//
cli.checkPerms();

// Print the cli if we've got tasks
if (fs.existsSync(process.landoTaskCacheFile)) {
  cli.run(getTasks(tooling, toolingLevel, config));
// Min bootstrap lando so we can generate the task cache first
} else {
  // NOTE: we require lando down here because it adds .5 seconds if we do it above
  const Lando = require('./../lib/lando');
  const lando = new Lando(cli.defaultConfig());
  // Bootstrap lando
  // Dump the tasks cache
  // Parse the tasks
  // Show the cli
  lando.bootstrap('CONFIG').then(lando => {
    lando.cache.set(process.landoTaskCacheName, JSON.stringify(lando.tasks), {persist: true});
    cli.run(getTasks(tooling, toolingLevel, config));
  });
}
