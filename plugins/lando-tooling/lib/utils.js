'use strict';

// Modules
const _ = require('lodash');
const esc = require('shell-escape');
const path = require('path');

/*
 * Helper to build commands
 */
exports.buildCommand = (app, command, needs, service, user) => ({
  id: `${app.project}_${service}_1`,
  compose: app.compose,
  project: app.project,
  cmd: command,
  opts: {
    mode: 'attach',
    pre: ['cd', exports.getContainerPath(app.root)].join(' '),
    user: user,
    services: _.compact(_.flatten([service, needs])),
    hijack: false,
    autoRemove: true,
  },
});

/*
 * Helper to build docker exec command
 */
exports.dockerExec = (lando, datum = {}) => lando.shell.sh([
  lando.config.dockerBin,
  'exec',
  '--interactive',
  '--tty',
  '--user',
  datum.opts.user,
  datum.id,
].concat(datum.cmd), {mode: 'attach', cstdio: ['inherit', 'inherit', 'ignore']});

/*
 * Helper to build tasks from metadata
 * // @TOD0
 */
exports.buildTask = (config, lando) => {
  const {name, app, cmd, describe, needs, options, service, user} = exports.toolingDefaults(config);
  // Get the run handler
  const run = answers => {
    // Handle dynamic services right away
    const container = exports.getContainer(service, answers);
    // Normalize any needs we have
    const auxServices = (_.isString(needs)) ? [needs] : needs;
    // Get passthrough options
    const passOpts = exports.getPassthruOpts(options, answers);
    // Initilize our app here if needed, this should be needed very rarely
    return lando.Promise.try(() => (_.isEmpty(app.compose)) ? app.init() : true)
    // Kick off the pre event wrappers
    .then(() => app.events.emit(`pre-${name}`, config))
    // Get an interable of our commandz
    .then(() => _.map(exports.parseCommand(cmd, container, passOpts)))
    .map(({command, container}) => exports.buildCommand(app, command, auxServices, container, user))
    // Try to run the task quickly first and then fallback to compose launch
    .each(runner => exports.dockerExec(lando, runner).catch(() => lando.engine.run(runner)).catch(error => {
      error.hide = true;
      throw error;
    }))
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

/*
 * Helper to get command
 */
const getCommand = (cmd, passOpts) => {
  // Extract the command if its an object
  if (_.isObject(cmd)) cmd = cmd[_.first(_.keys(cmd))];
  // Build and return
  const command = [cmd];
  // Strip globaltOpts
  if (process.lando === 'node') command.push(exports.getOpts());
  // Add passOpts
  command.push(passOpts);
  return _.flatten(command);
};

/*
 * Helper to grab dynamic container if needed
 */
exports.getContainer = (service, answer) => (_.startsWith(service, ':')) ? answer[service.split(':')[1]] : service;

/*
 * Helper to map the cwd on the host to the one in the container
 */
exports.getContainerPath = appRoot => {
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
 * Helper to get service
 */
const getService = (cmd, service) => (_.isObject(cmd)) ? _.first(_.keys(cmd)) : service;

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
 * Helper to emit events, run commands and catch errors
 */
exports.runCommands = (name, events, engine, cmds, inject = {}) => events.emit(['pre', name].join('-'), inject)
  // Run commands
  .then(() => engine.run(cmds))
  // Catch error but hide the stdout
  .catch(error => {
    error.hide = true;
    throw error;
  })
  // Post event
  .then(() => events.emit(['post', name].join('-'), inject));

/*
 * Helper to get defaults
 */
exports.toolingDefaults = ({
  name,
  app = {},
  cmd = name,
  description = `Run ${name} commands`,
  needs = [],
  options = {},
  service = '',
  // @TODO: some better toggle here?
  user = 'www-data'} = {}) =>
  ({
    name: cmd,
    app: app,
    cmd: cmd,
    describe: description,
    needs: needs,
    options: options,
    service: service,
    user: user,
  });
