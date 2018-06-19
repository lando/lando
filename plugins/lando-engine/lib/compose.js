'use strict';

// Modules
const _ = require('lodash');
const esc = require('shell-escape');
const escSpaces = require('./utils').escSpaces;

// Helper array for options
const composeFlags = {
  background: '-d',
  environment: '-e',
  follow: '--follow',
  force: '--force',
  noCache: '--no-cache',
  noDeps: '--no-deps',
  pull: '--pull',
  q: '-q',
  recreate: '--force-recreate',
  removeOrphans: '--remove-orphans',
  rm: '--rm',
  timestamps: '--timestamps',
  volumes: '-v',
};

/*
 * Parse entrypoint
 */
const parseEntrypoint = entrypoint => (_.isArray(entrypoint)) ? escSpaces(entrypoint.join(' ')) : entrypoint;

/*
 * Parse docker-compose options
 */
const parseOptions = (opts = {}) => {
  const flags = _.map(composeFlags, (value, key) => _.has(opts, key) ? value : '');
  const environment = _.flatten(_.map(opts.environment, variable => ['-e', variable]));
  const user = _.map(opts.user, user => ['--user', user]);
  const entrypoint = _.map(opts.entrypoint, entrypoint => ['--entrypoint', parseEntrypoint(entrypoint)]);
  return _.flatten(_.compact(flags, environment, user, entrypoint));
};

/*
 * Parse docker-compose args
 */
const parseArgs = (args = {}) => {
  const services = _.map(args.services, service => service);
  return _.flatten(_.compact([services, args.cmd]));
};

/*
 * Helper to standardize construction of docker commands
 */
const buildCmd = (run, name, compose, args = {}, opts = {}) => {
  if (!name) {
    throw new Error('Need to give this composition a project name!');
  }
  const project = ['--project-name', name];
  const files = _.flatten(_.map(compose, unit => ['--file', unit]));
  const options = parseOptions(opts);
  const argz = parseArgs(args, opts.entrypoint);
  return _.flatten([project, files, run, options, argz]);
};

/*
 * You can do a create, rebuild and start with variants of this
 */
exports.start = (compose, project, opts = {}) => {
  // Default options
  const defaults = {
    background: true,
    recreate: false,
    removeOrphans: true,
  };
  // Up us
  return {
    cmd: buildCmd('up', project, compose, {services: opts.services}, _.merge({}, defaults, opts)),
    opts: {app: opts.app, mode: 'collect'},
  };
};

/*
 * Run docker compose pull
 */
exports.getId = (compose, project, opts = {}) => ({
  cmd: buildCmd('ps', project, compose, {services: opts.services}, _.merge({q: true}, opts)),
  opts: {app: opts.app},
});

/*
 * Run docker compose build
 */
exports.build = (compose, project, opts = {}) => {
  // Default options
  const defaults = {
    noCache: false,
    pull: true,
  };
  // Return
  return {
    cmd: buildCmd('build', project, compose, {}, _.merge({}, defaults, opts)),
    opts: {app: opts.app, mode: 'collect'},
  };
};

/*
 * Run docker compose pull
 */
exports.pull = (compose, project, opts = {}) => {
  // Let's get a list of all our services that need to be pulled
  // eg not built from a local dockerfile
  const images = _.filter(_.keys(_.get(opts, 'app.services'), []), service => {
    !_.has(opts.app.services, service + '.build');
  });
  // If the user has selected something then intersect, if not use all image driven services
  opts.services = (!_.isEmpty(opts.services)) ? _.intersection(opts.services, images) : images;
  return {
    cmd: buildCmd('pull', project, compose, {services: opts.services}, opts),
    opts: {app: opts.app, mode: 'collect'},
  };
};

/*
 * Run docker compose Kill
 * @NOTE: we use kill for speeeeeedzzz
 */
exports.stop = (compose, project, opts = {}) => {
  return {
    cmd: buildCmd('kill', project, compose, {services: opts.services}, opts),
    opts: {app: opts.app, mode: 'collect'},
  };
};

/*
 * Run docker compose run
 */
exports.run = (compose, project, opts = {}) => {
  // Default options
  const defaults = {
    user: 'root',
  };
  // Make cmd is an array lets desconstruct and escape
  if (_.isArray(opts.cmd)) opts.cmd = escSpaces(esc(opts.cmd), 'linux');
  // Add in any prefix commands
  if (_.has(opts, 'pre')) opts.cmd = [opts.pre, opts.cmd].join('&&');
  // Remake command
  opts.cmd = ['/bin/sh', '-c', opts.cmd];
  // Build the command
  return {
    cmd: buildCmd('exec', project, compose, {services: opts.services, cmd: opts.cmd}, _.merge({}, defaults, opts)),
    opts: {app: opts.app, mode: 'attach'},
  };
};

/*
 * Run docker compose logs
 */
exports.logs = (compose, project, opts = {}) => {
  // Default options
  const defaults = {
    follow: false,
    timestamps: false,
  };
  // Build the command
  return {
    cmd: buildCmd('logs', project, compose, {services: opts.services}, _.merge({}, defaults, opts)),
    opts: {app: opts.app, mode: 'attach'},
  };
};

/*
 * Run docker compose remove
 */
exports.remove = (compose, project, opts = {}) => {
  // Default down options
  const defaultDowns = {
    removeOrphans: true,
    volumes: true,
  };

  // Default rm options
  const defaultRms = {
    force: true,
    volumes: true,
  };

  // Get opts
  const defaults = (opts.purge) ? defaultDowns : defaultRms;
  const options = (opts) ? _.merge(defaults, opts) : defaults;

  // Get subcommand
  const subCmd = (opts.purge) ? 'down' : 'rm';

  // Build the command and run it
  return {
    cmd: buildCmd(subCmd, project, compose, {services: opts.services}, _.merge({}, options)),
    opts: {app: opts.app, mode: 'collect'},
  };
};
