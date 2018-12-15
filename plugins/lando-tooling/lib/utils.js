'use strict';

// Modules
const _ = require('lodash');
const esc = require('shell-escape');
const path = require('path');
const parse = require('string-argv');

/*
 * Helper to get service
 */
const getService = (cmd, service) => (_.isObject(cmd)) ? _.first(_.keys(cmd)) : service;

/*
 * Helper to build commands
 */
const buildCommand = (app, command, service, user) => ({
  id: `${app.project}_${service}_1`,
  compose: app.compose,
  project: app.project,
  cmd: command,
  opts: {
    mode: 'attach',
    pre: ['cd', exports.getContainerPath(app.root)].join(' '),
    user: user,
    services: _.compact([service]),
    hijack: false,
    autoRemove: true,
  },
});


/*
 * Helper to get command
 */
const getCommand = (cmd, passOpts) => {
  console.log(cmd)
  // Extract the command if its an object
  if (_.isObject(cmd)) cmd = cmd[_.first(_.keys(cmd))];
  // Build and return
  const command = [cmd];
  // Strip globaltOpts
  if (process.lando === 'node') command.push(exports.getOpts());
  // Add passOpts
  command.push(passOpts);
  console.log(command)
  return _.flatten(command);
};

/*
 * Helper to grab dynamic container if needed
 */
const getContainer = (service, answer) => (_.startsWith(service, ':')) ? answer[service.split(':')[1]] : service;

/*
 * Helper to map the cwd on the host to the one in the container
 */
const getContainerPath = appRoot => {
  // Break up our app root and cwd so we can get a diff
  const cwd = process.cwd().split(path.sep);
  const dir = _.drop(cwd, appRoot.split(path.sep).length);
  // Add our in-container app root
  // this will always be /app
  dir.unshift('/app');
  // Return the directory
  return dir.join('/');
};

/*
 * Helper to process args
 *
 * We assume pass through commands so let's use argv directly and strip out
 * the first three assuming they are [node, lando.js, options.name]'
 * Check to see if we have global lando opts and remove them if we do
 */
exports.getOpts = (argopts = process.argv.slice(3)) => {
  return (_.indexOf(argopts, '--') >= 0) ? _.slice(argopts, 0, _.indexOf(argopts, '--')) : argopts;
};

/*
 * Helper to get passthru options
 */
exports.getPassthruOpts = (options = {}, answers = {}) => _(options)
  .map((value, key) => _.merge({}, {name: key}, value))
  .filter(value => value.passthrough === true)
  .map(value => esc(`--${value.name}=${answers[value.name]}`))
  .value();


/*
 * Helper to get tts
 */
exports.getToolingTasks = (config, app) => _(config)
  .map((task, name) => _.merge({}, task, {app, name}))
  .filter(task => _.isObject(task))
  .value();

/*
 * Helper to parse tooling config options
 */
exports.parseCommand = (cmd, service, passOpts = []) => _.map(!_.isArray(cmd) ? [cmd] : cmd, command => ({
  command: getCommand(command, passOpts),
  container: getService(command, service),
}));

/*
 * Helper to get defaults
 */
exports.toolingDefaults = ({
  name,
  app = {},
  cmd = name,
  description = `Run ${name} commands`,
  options = {},
  service = '',
  // @TODO: some better toggle here?
  user = 'www-data'} = {}) =>
  ({
    name,
    app: app,
    cmd: cmd,
    describe: description,
    options: options,
    service: service,
    user: user,
  });

/*
 * Helper to build tasks from metadata
 * // @TOD0
 */
exports.buildTask = (config, lando) => {
  const {name, app, cmd, describe, options, service, user} = exports.toolingDefaults(config);
  // Get the run handler
  const run = answers => {
    console.log(answers);
    // Handle dynamic services right away
    // set SERVICE from answers and strip out that noise from the rest of
    // stuff, check answers/argv for --service or -s, validate and then remove
    const container = exports.getContainer(service, answers);
    console.log(container);
    // Get passthrough options,
    const passOpts = exports.getPassthruOpts(options, answers);
    // Initilize our app here if needed, this should be needed very rarely
    return lando.Promise.try(() => (_.isEmpty(app.compose)) ? app.init() : true)
    // Kick off the pre event wrappers
    .then(() => app.events.emit(`pre-${name}`, config))
    // Get an interable of our commandz
    .then(() => _.map(exports.parseCommand(cmd, container, passOpts)))
    .map(({command, container}) => exports.buildCommand(app, command, container, user))
    // Try to run the task quickly first and then fallback to compose launch
    .each(runner => {
      console.log(runner)
      process.exit(1)
      return exports.dockerExec(lando, runner).catch(() => lando.engine.run(runner)).catch(error => {
      error.hide = true;
      throw error;
    })})
    // Post event
    .then(() => app.events.emit(`post-${name}`, config));
  };

  // Return our tasks
  return {
    command: name,
    describe,
    run: run,
    options: options,
  };
};
