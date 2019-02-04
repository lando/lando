'use strict';

// Modules
const _ = require('lodash');
const merger = require('./config').merge;
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/*
 * Helper to determine bootstrap level
 */
const getBsLevel = (config, command) => {
  if (_.has(config, `tooling.${command}.level`)) return config.tooling[command].level;
  else return (!fs.existsSync(config.composeCache)) ? 'app' : 'engine';
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

/*
 * Helper to run the app task runner
 */
const appRunner = command => (argv, lando) => {
  const app = lando.getApp(argv._app.root);
  return app.init().then(() => _.find(app.tasks, {command}).run(argv));
};

/*
 * Helper to return the engine task runner
 */
const engineRunner = (config, command) => (argv, lando) => {
  const AsyncEvents = require('./events');
  // Build a minimal app
  const app = lando.cache.get(path.basename(config.composeCache));
  app.config = config;
  app.events = new AsyncEvents(lando.log);
  // Load only what we need so we don't pay the appinit penalty
  const utils = require('./../plugins/lando-tooling/lib/utils');
  const buildTask = require('./../plugins/lando-tooling/lib/build');
  require('./../plugins/lando-events/app')(app, lando);
  app.config.tooling = utils.getToolingTasks(app.config.tooling, app);
  // Load and run
  return buildTask(_.find(app.config.tooling, task => task.name === command), lando).run(argv);
};


/*
 * Helper to traverse up directories from a start point
 */
const traverseUp = file => _(_.range(path.dirname(file).split(path.sep).length))
  .map(end => _.dropRight(path.dirname(file).split(path.sep), end).join(path.sep))
  .map(dir => path.join(dir, path.basename(file)))
  .value();

/*
 * Helper to build config
 */
exports.buildConfig = options => {
  // Modules
  const hasher = require('object-hash');
  const helpers = require('./config');
  // Start building the config
  let config = helpers.merge(helpers.defaults(), options);
  // If we have configSources let's merge those in as well
  if (!_.isEmpty(config.configSources)) config = helpers.merge(config, helpers.loadFiles(config.configSources));
  // If we have an envPrefix set then lets merge that in as well
  if (_.has(config, 'envPrefix')) config = helpers.merge(config, helpers.loadEnvs(config.envPrefix));
  // Add some final computed properties to the config
  config.instance = hasher(config.userConfRoot);
  // Do some engine config setup
  // Strip all DOCKER_ and COMPOSE_ envvars
  config.env = helpers.stripEnv('DOCKER_');
  config.env = helpers.stripEnv('COMPOSE_');
  // Set up the default engine config if needed
  config.engineConfig = helpers.getEngineConfig(config);
  // Add some docker compose protection on windows
  if (process.platform === 'win32') config.env.COMPOSE_CONVERT_WINDOWS_PATHS = 1;
  // Return the config
  return config;
};

/*
 * Helper for docker compose
 * @TODO: eventually this needs to live somewhere else so we can have a better
 * default engine instantiation
 */
exports.dc = (shell, bin, cmd, {compose, project, opts = {}}) => {
  const dockerCompose = require('./compose');
  const run = dockerCompose[cmd](compose, project, opts);
  return shell.sh([bin].concat(run.cmd), run.opts);
};

/*
 * Helper to load a very basic app
 */
exports.getApp = (files, userConfRoot) => {
  const config = merger({}, ..._.map(files, file => loadLandoFile(file)));
  return _.merge({}, config, {
    configFiles: files,
    metaCache: `${config.name}.meta.cache`,
    project: _.toLower(config.name).replace(/_|-|\.+/g, ''),
    root: path.dirname(files[0]),
    composeCache: path.join(userConfRoot, 'cache', `${config.name}.compose.cache`),
    toolingCache: path.join(userConfRoot, 'cache', `${config.name}.tooling.cache`),
  });
};

/*
 * Helper to find lando files we can use
 */
exports.getLandoFiles = (files = [], startFrom = process.cwd()) => _(files)
  .flatMap(file => traverseUp(path.resolve(startFrom, file)))
  .sortBy().reverse()
  .filter(file => fs.existsSync(file) && path.isAbsolute(file))
  .thru(files => _.isEmpty(files) ? [] : [_.first(files)])
  .flatMap(dirFile => _.map(files, file => path.join(path.dirname(dirFile), file)))
  .filter(file => fs.existsSync(file))
  .value();

/*
 * Helper to parse tasks
 * @NOTE: if this is being run we assume the existence of cacheTasksFile
 * @NOTE: i guess we are not really factoring in whether lando-tooling is disabled or not?
 * @TODO: do we need some validation of the dumped tasks here?
 */
exports.getTasks = (config = {}, argv = {}, tasks = []) => {
  // If we have a recipe lets rebase on that
  if (_.has(config, 'recipe')) config.tooling = _.merge({}, loadCacheFile(config.toolingCache), config.tooling);
  // If the tooling command is being called lets assess whether we can get away with engine bootstrap level
  const level = (_.includes(_.keys(config.tooling), argv._[0])) ? getBsLevel(config, argv._[0]) : 'app';
  // Load all the tasks
  _.forEach(_.get(config, 'tooling', {}), (task, command) => {
    tasks.push({
      command,
      level,
      describe: _.get(task, 'description', `Runs ${command} commands`),
      options: _.get(task, 'options', {}),
      run: (level === 'app') ? appRunner(command) : engineRunner(config, command),
    });
  });
  return tasks.concat(loadCacheFile(process.landoTaskCacheFile));
};

/*
 * Helper to setup cache
 */
exports.setupCache = (log, config) => {
  const random = require('uuid/v4');
  const Cache = require('./cache');
  const cache = new Cache({log, cacheDir: path.join(config.userConfRoot, 'cache')});
  if (!cache.get('id')) cache.set('id', random(), {persist: true});
  config.user = cache.get('id');
  config.id = config.user;
  return cache;
};

/*
 * Helper to setup engine
 */
exports.setupEngine = (config, cache, events, log, shell, id) => {
  const Engine = require('./engine');
  const Landerode = require('./docker');
  const LandoDaemon = require('./daemon');
  const docker = new Landerode(config.engineConfig, id);
  const daemon = new LandoDaemon(cache, events, config.dockerBin, log, config.process);
  const compose = (cmd, datum) => exports.dc(shell, config.composeBin, cmd, datum);
  return new Engine(daemon, docker, compose);
};

/*
 * Helper to setup metrics
 */
exports.setupMetrics = (log, config) => {
  const Metrics = require('./metrics');
  return new Metrics({
    log,
    id: config.id,
    endpoints: config.stats,
    data: {
      context: _.has(process, 'env.CI') ? 'ci' : 'local',
      devMode: false,
      nodeVersion: process.version,
      mode: config.mode || 'unknown',
      os: config.os,
      product: config.product,
      version: config.version,
    },
  });
};
