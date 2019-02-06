'use strict';

// Modules
const _ = require('lodash');
const escape = require('./../../../lib/utils').shellEscape;
const getUser = require('./../../../lib/utils').getUser;
const getCliEnvironment = require('./../../../lib/utils').getCliEnvironment;
const path = require('path');

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
 * Build docker exec opts
 */
const getExecOpts = (docker, datum) => {
  const exec = [docker, 'exec'];
  // Should use interactive if we arent running this in leia
  if (process.stdin.isTTY) {
    exec.push('--tty');
    exec.push('--interactive');
  }
  // Add user and workdir
  exec.push('--user');
  exec.push(datum.opts.user);
  exec.push('--workdir');
  exec.push(datum.opts.workdir);
  // Add envvvars
  _.forEach(datum.opts.environment, (value, key) => {
    exec.push('--env');
    exec.push(`${key}=${value}`);
  });
  // Add id
  exec.push(datum.id);
  return exec;
};

/*
 * Helper to get dynamic service keys for stripping
 */
const getDynamicKeys = (answer, answers = {}) => _(answers)
  .map((value, key) => ({key, value}))
  .filter(data => data.value === answer)
  .map(data => data.key)
  .map(key => (_.size(key) === 1) ? `-${key}` : `--${key}`)
  .value();

/*
 * Helper to handle dynamic services
 *
 * Set SERVICE from answers and strip out that noise from the rest of
 * stuff, check answers/argv for --service or -s, validate and then remove
 */
const handleDynamic = (config, options = {}, answers = {}) => {
  if (_.startsWith(config.service, ':')) {
    const answer = answers[config.service.split(':')[1]];
    // Remove dynamic service option from argv
    _.remove(process.argv, arg => _.includes(getDynamicKeys(answer, answers).concat(answer), arg));
    // Return updated config
    return _.merge({}, config, {service: answers[config.service.split(':')[1]]});
  } else {
    return config;
  }
};

/*
 * Helper to process args
 *
 * We assume pass through commands so let's use argv directly and strip out
 * the first three assuming they are [node, lando.js, options.name]'
 * Check to see if we have global lando opts and remove them if we do
 */
const handleOpts = (config, argopts = process.argv.slice(3)) => {
  // If this is not a CLI then we can pass right back
  if (process.lando !== 'node') return config;
  // Return
  return _.merge({}, config, {command: config.command.concat(argopts)});
};

/*
 * Helper to get passthru options
 */
const handlePassthruOpts = (options = {}, answers = {}) => _(options)
  .map((value, key) => _.merge({}, {name: key}, value))
  .filter(value => value.passthrough === true)
  .map(value => `--${value.name}=${answers[value.name]}`)
  .value();

/*
 * Helper to convert a command into config object
 */
const parseCommand = (cmd, service) => ({
  command: (_.isObject(cmd)) ? cmd[_.first(_.keys(cmd))] : cmd,
  service: (_.isObject(cmd)) ? _.first(_.keys(cmd)) : service,
});

/*
 * Helper to build commands
 */
exports.buildCommand = (app, command, service, user) => ({
  id: `${app.project}_${service}_1`,
  compose: app.compose,
  project: app.project,
  cmd: command,
  opts: {
    environment: getCliEnvironment(),
    mode: 'attach',
    workdir: getContainerPath(app.root),
    user: user,
    services: _.compact([service]),
    hijack: false,
    autoRemove: true,
  },
});

/*
 * Helper to build docker exec command
 */
exports.dockerExec = (lando, datum = {}) => lando.shell.sh(
  getExecOpts(lando.config.dockerBin, datum).concat(datum.cmd),
  {mode: 'attach', cstdio: ['inherit', 'inherit', 'ignore']}
);

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
exports.parseConfig = (cmd, service, options = {}, answers = {}) => _(cmd)
  // Put into an object so we can handle "multi-service" tooling
  .map(cmd => parseCommand(cmd, service))
  // Handle dynamic services
  .map(config => handleDynamic(config, options, answers))
  // Parse the cmds into something more usable for shell.sh
  .map(config => _.merge({}, config, {command: escape(config.command)}))
  // Add in any argv extras if they've been passed in
  .map(config => handleOpts(config))
  // Append passthru options so that interactive responses are permitted
  // @TODO: this will double add opts that are already passed in non-interactively, is that a problem?
  .map(config => _.merge({}, config, {command: config.command.concat(handlePassthruOpts(options, answers))}))
  // Wrap the command in /bin/sh if that makes sense
  .map(config => _.merge({}, config, {command: escape(config.command, true)}))
  // Put into an object
  .value();

/*
 * Helper to get defaults
 */
exports.toolingDefaults = ({
  name,
  app = {},
  cmd = name,
  description = `Runs ${name} commands`,
  options = {},
  service = '',
  user = null} = {}) =>
  ({
    name,
    app: app,
    cmd: !_.isArray(cmd) ? [cmd] : cmd,
    describe: description,
    options: options,
    service: service,
    user: (user === null) ? getUser(service, app.info) : user,
  });
