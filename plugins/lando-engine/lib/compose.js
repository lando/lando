'use strict';

// Modules
const _ = require('lodash');
const esc = require('shell-escape');
const utils = require('./utils');

/*
 * Parse general docker options
 */
const parseOptions = (opts = {}) => {
  // Start flag collector
  const flags = [];

  // Return empty if we have no opts
  if (!opts) return flags;

  // Boolean opts
  // @todo: probably just define a mapping object for this
  if (opts.q) flags.push('-q');
  if (opts.background) flags.push('-d');
  if (opts.recreate) flags.push('--force-recreate');
  if (opts.removeOrphans) flags.push('--remove-orphans');
  if (opts.nocache) flags.push('--no-cache');
  if (opts.pull) flags.push('--pull');
  if (opts.force)flags.push('--force');
  if (opts.volumes) flags.push('-v');
  if (opts.follow) flags.push('--follow');
  if (opts.timestamps) flags.push('--timestamps');
  if (opts.noDeps) flags.push('--no-deps');
  if (opts.rm) flags.push('--rm');

  // Change the entrypoint
  if (opts.entrypoint) {
    flags.push('--entrypoint');
    if (_.isArray(opts.entrypoint)) {
      flags.push(utils.escSpaces(opts.entrypoint.join(' ')));
    } else {
      flags.push(opts.entrypoint);
    }
  }

  // Add additional ENVs
  if (opts.environment) {
    _.forEach(opts.environment, envVar => {
      flags.push('-e');
      flags.push(envVar);
    });
  }

  // Add user
  if (opts.user) {
    flags.push('--user');
    flags.push(opts.user);
  }

  // Return any and all flags
  return flags;
};

/*
 * Helper to standardize construction of docker commands
 */
const buildCmd = (compose, project, run, opts) => {
  // A project is required
  if (!project) {
    throw new Error('Need to give this composition a project name!');
  }

  // Kick off options
  let cmd = ['--project-name', project];

  // Export our compose stuff and add to commands
  _.forEach(compose, unit => {
    cmd.push('--file');
    cmd.push(unit);
  });

  // Get our compose files and build the pre opts
  cmd = cmd.concat([run]);

  // Get options
  cmd = cmd.concat(parseOptions(opts));

  // Add in a services arg if its there
  if (opts && opts.services) {
    _.forEach(opts.services, service => {
      cmd.push(service);
    });
  }

  // Add a hacky conditional here because windoze seems to handle this weirdly
  // @todo: remove the above during unit testing
  if (opts && opts.cmd && run === 'exec') {
    if (typeof opts.cmd === 'string') {
      opts.cmd = [opts.cmd];
    }
    if (_.isArray(opts.entrypoint)) {
      cmd.push(utils.escSpaces(opts.cmd.join(' ')));
    } else {
      cmd = _.flatten(cmd.concat(opts.cmd));
    }
  }

  return cmd;
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
    cmd: buildCmd(compose, project, 'up', _.merge({}, defaults, opts)),
    opts: {app: opts.app, mode: 'collect'},
  };
};

/*
 * Run docker compose pull
 */
exports.getId = (compose, project, opts = {}) => ({
  cmd: buildCmd(compose, project, 'ps', _.merge({}, {q: true}, opts)),
  opts: {app: opts.app},
});

/*
 * Run docker compose build
 */
exports.build = (compose, project, opts) => {
  // Default options
  const defaults = {
    nocache: false,
    pull: true,
  };

  // Let's make sure we are building everything
  delete opts.services;

  // Get opts
  const options = (opts) ? _.merge(defaults, opts) : defaults;

  // Return
  return {
    cmd: buildCmd(compose, project, 'build', options),
    opts: {app: opts.app, mode: 'collect'},
  };
};

/*
 * Run docker compose pull
 */
exports.pull = (compose, project, opts) => {
  // Let's get a list of all our services that need to be pulled
  // eg not built from a local dockerfile
  const images = _.filter(_.keys(_.get(opts, 'app.services'), []), service => {
    !_.has(opts.app.services, service + '.build');
  });

  // If the user has selected something then intersept, if not use all image driven services
  opts.services = (!_.isEmpty(opts.services)) ? _.intersection(opts.services, images) : images;

  return {
    cmd: buildCmd(compose, project, 'pull', opts),
    opts: {app: opts.app, mode: 'collect'},
  };
};

/*
 * Run docker compose Kill
 * @NOTE: we use kill for speeeeeedzzz
 */
exports.stop = (compose, project, opts) => ({
  cmd: buildCmd(compose, project, 'kill', opts),
  opts: {app: opts.app, mode: 'collect'},
});

/*
 * Run docker compose run
 */
exports.run = (compose, project, opts) => {
  // Default options
  const defaults = {
    user: 'root',
  };

  // Make cmd is an array lets desconstruct and escape
  if (_.isArray(opts.cmd)) {
    opts.cmd = utils.escSpaces(esc(opts.cmd), 'linux');
  }

  // Add in any prefix commands
  if (_.has(opts, 'pre')) {
    opts.cmd = [opts.pre, opts.cmd].join('&&');
  }

  // Remake command
  opts.cmd = ['/bin/sh', '-c', opts.cmd];

  // Get opts
  const options = (opts) ? _.merge(defaults, opts) : defaults;

  // Build the command
  return {
    cmd: buildCmd(compose, project, 'exec', options),
    opts: {app: opts.app, mode: 'attach'},
  };
};

/*
 * Run docker compose logs
 */
exports.logs = (compose, project, opts) => {
  // Default options
  const defaults = {
    follow: false,
    timestamps: false,
  };

  // Get opts
  const options = (opts) ? _.merge(defaults, opts) : defaults;

  // Build the command
  return {
    cmd: buildCmd(compose, project, 'logs', options),
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
    cmd: buildCmd(compose, project, subCmd, _.merge({}, options)),
    opts: {app: opts.app, mode: 'collect'},
  };
};
