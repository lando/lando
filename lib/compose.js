'use strict';

// Modules
const _ = require('lodash');

// Helper to determine our TTY status
const isTTY = () => process.lando === 'node' && process.env.LEIA_PARSER_RUNNING !== 'true';

// Helper object for flags
const composeFlags = {
  background: '-d',
  detach: '-d',
  environment: '-e',
  follow: '--follow',
  force: '--force',
  noCache: '--no-cache',
  noRecreate: '--no-recreate',
  noDeps: '--no-deps',
  noTTY: '-T',
  pull: '--pull',
  q: '-q',
  recreate: '--force-recreate',
  removeOrphans: '--remove-orphans',
  rm: '--rm',
  timestamps: '--timestamps',
  volumes: '-v',
};

// Default options
const defaultOptions = {
  build: {noCache: false, pull: true},
  down: {removeOrphans: true, volumes: true},
  exec: {detach: false, noTTY: !isTTY()},
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
  const environment = _.flatten(_.map(opts.environment, variable => ['-e', variable]));
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
const buildShell = (run, name, compose, opts = {}, mode = 'collect') => ({
  cmd: buildCmd(run, name, compose, {services: opts.services, cmd: opts.cmd}, mergeOpts(run, opts)),
  opts: {mode},
});

/*
 * Run docker compose build
 */
exports.build = (compose, project, opts = {}) => buildShell('build', project, compose, opts);

/*
 * Run docker compose pull
 */
exports.getId = (compose, project, opts = {}) => buildShell('ps', project, compose, opts, 'exec');

/*
 * Run docker compose logs
 */
exports.logs = (compose, project, opts = {}) => buildShell('logs', project, compose, opts, 'attach');

/*
 * Run docker compose pull
 */
exports.pull = (compose, project, opts = {}) => buildShell('pull', project, compose, opts);

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
exports.run = (compose, project, opts = {}) => buildShell('exec', project, compose, opts, 'attach');

/*
 * You can do a create, rebuild and start with variants of this
 */
exports.start = (compose, project, opts = {}) => buildShell('up', project, compose, opts);

/*
 * Run docker compose Kill
 * @NOTE: we use kill for speeeeeedzzz
 */
exports.stop = (compose, project, opts = {}) => buildShell('kill', project, compose, opts);
