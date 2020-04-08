'use strict';

// Modules
const _ = require('lodash');

// Helper object for flags
const composeFlags = {
  background: '--detach',
  detach: '--detach',
  follow: '--follow',
  force: '--force',
  noCache: '--no-cache',
  noRecreate: '--no-recreate',
  noDeps: '--no-deps',
  noTTY: '-T',
  pull: '--pull',
  q: '--quiet',
  recreate: '--force-recreate',
  removeOrphans: '--remove-orphans',
  rm: '--rm',
  timestamps: '--timestamps',
  volumes: '-v',
};

// Default options nad things
const defaultOptions = {
  build: {noCache: false, pull: true},
  down: {removeOrphans: true, volumes: true},
  exec: {detach: false, noTTY: !process.stdin.isTTY},
  kill: {},
  logs: {follow: false, timestamps: false},
  ps: {q: true},
  pull: {},
  rm: {force: true, volumes: true},
  up: {background: true, noRecreate: true, recreate: false, removeOrphans: true},
};

/*
 * Helper to merge options with default
 */
const mergeOpts = (run, opts = {}) => _.merge({}, defaultOptions[run], opts);

/*
 * Parse docker-compose options
 */
const parseOptions = (opts = {}) => {
  const flags = _.map(composeFlags, (value, key) => _.get(opts, key, false) ? value : '');
  const environment = _.flatMap(opts.environment, (value, key) => ['--env', `${key}=${value}`]);
  const user = (_.has(opts, 'user')) ? ['--user', opts.user] : [];
  const workdir = (_.has(opts, 'workdir')) ? ['--workdir', opts.workdir] : [];
  const entrypoint = _.map(opts.entrypoint, entrypoint => ['--entrypoint', entrypoint]);
  return _.compact(_.flatten([flags, environment, user, workdir, entrypoint]));
};

/*
 * Helper to standardize construction of docker commands
 */
const buildCmd = (run, name, compose, {services, cmd}, opts = {}) => {
  if (!name) throw new Error('Need to give this composition a project name!');
  // @TODO: we need to strip out opts.user on start/stop because we often get it as part of run
  const project = ['--project-name', name];
  const files = _.flatten(_.map(compose, unit => ['--file', unit]));
  const options = parseOptions(opts);
  const argz = _.flatten(_.compact([services, cmd]));
  return _.flatten([project, files, run, options, argz]);
};

/*
 *  Helper to build build object needed by lando.shell.sh
 */
const buildShell = (run, name, compose, opts = {}) => ({
  cmd: buildCmd(run, name, compose, {services: opts.services, cmd: opts.cmd}, mergeOpts(run, opts)),
  opts: {mode: 'spawn', cstdio: opts.cstdio, silent: opts.silent},
});

/*
 * Run docker compose build
 */
exports.build = (compose, project, opts = {}) => {
  return buildShell('build', project, compose, {pull: _.isEmpty(opts.local)});
};

/*
 * Run docker compose pull
 */
exports.getId = (compose, project, opts = {}) => buildShell('ps', project, compose, opts);

/*
 * Run docker compose logs
 */
exports.logs = (compose, project, opts = {}) => buildShell('logs', project, compose, opts);

/*
 * Run docker compose pull
 */
exports.pull = (compose, project, opts = {}) => {
  const pull = _(opts.pullable).filter(service => {
    return _.isEmpty(opts.services) || _.includes(opts.services, service);
  }).value();
  if (!_.isEmpty(pull)) return buildShell('pull', project, compose, {services: pull});
  else return buildShell('ps', project, compose, {});
};

/*
 * Run docker compose remove
 */
exports.remove = (compose, project, opts = {}) => {
  const subCmd = (opts.purge) ? 'down' : 'rm';
  return buildShell(subCmd, project, compose, opts);
};

/*
 * Run docker compose run
 */
exports.run = (compose, project, opts = {}) => buildShell('exec', project, compose, opts);

/*
 * You can do a create, rebuild and start with variants of this
 */
exports.start = (compose, project, opts = {}) => buildShell('up', project, compose, opts);

/*
 * Run docker compose kill
 */
exports.stop = (compose, project, opts = {}) => buildShell('kill', project, compose, opts);
