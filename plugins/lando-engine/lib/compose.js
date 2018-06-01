'use strict';

// Modules
var _ = require('lodash');
var esc = require('shell-escape');
var utils = require('./utils');

/*
 * Parse general docker options
 */
var parseOptions = function(opts) {

  // Start flag collector
  var flags = [];

  // Return empty if we have no opts
  if (!opts) {
    return flags;
  }

  // Inspect opts
  if (opts.q) {
    flags.push('-q');
  }

  // Daemon opts
  if (opts.background) {
    flags.push('-d');
  }

  // Recreate opts
  if (opts.recreate) {
    flags.push('--force-recreate');
  }

  // Remove orphans
  if (opts.removeOrphans) {
    flags.push('--remove-orphans');
  }

  // Cache opts
  if (opts.nocache) {
    flags.push('--no-cache');
  }

  // Pull opts
  if (opts.pull) {
    flags.push('--pull');
  }

  // Removal opts
  if (opts.force) {
    flags.push('--force');
  }
  if (opts.volumes) {
    flags.push('-v');
  }

  // Log opts
  if (opts.follow) {
    flags.push('--follow');
  }
  if (opts.timestamps) {
    flags.push('--timestamps');
  }

  // Run options
  // Do not start linked containers
  if (opts.noDeps) {
    flags.push('--no-deps');
  }

  // Change the entrypoint
  if (opts.entrypoint) {
    flags.push('--entrypoint');
    if (_.isArray(opts.entrypoint)) {
      flags.push(utils.escSpaces(opts.entrypoint.join(' ')));
    }
    else {
      flags.push(opts.entrypoint);
    }
  }

  // Remove the container after the run is done
  if (opts.rm) {
    flags.push('--rm');
  }

  // Add additional ENVs
  if (opts.environment) {
    _.forEach(opts.environment, function(envVar) {
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
var buildCmd = function(compose, project, run, opts) {

  // A project is required
  if (!project) {
    throw new Error('Need to give this composition a project name!');
  }

  // Kick off options
  var cmd = ['--project-name', project];

  // Export our compose stuff and add to commands
  _.forEach(compose, function(unit) {
    cmd.push('--file');
    cmd.push(unit);
  });

  // Get our compose files and build the pre opts
  cmd = cmd.concat([run]);

  // Get options
  cmd = cmd.concat(parseOptions(opts));

  // Add in a services arg if its there
  if (opts && opts.services) {
    _.forEach(opts.services, function(service) {
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
    }
    else {
      cmd = _.flatten(cmd.concat(opts.cmd));
    }
  }

  return cmd;

};

/*
 * You can do a create, rebuild and start with variants of this
 */
exports.start = function(compose, project, opts) {

  // Default options
  var defaults = {
    background: true,
    recreate: false,
    removeOrphans: true
  };

  // Get opts
  var options = (opts) ? _.merge(defaults, opts) : defaults;

  // Up us
  return {
    cmd: buildCmd(compose, project, 'up', options),
    opts: {app: opts.app, mode: 'collect'}
  };

};

/*
 * Run docker compose pull
 */
exports.getId = function(compose, project, opts) {

  // Default options
  var defaults = {
    q: true
  };

  // Get opts
  var options = (opts) ? _.merge(defaults, opts) : defaults;

  // Return
  return {
    cmd: buildCmd(compose, project, 'ps', options),
    opts: {app: opts.app}
  };

};

/*
 * Run docker compose build
 */
exports.build = function(compose, project, opts) {

  // Default options
  var defaults = {
    nocache: false,
    pull: true
  };

  // Let's make sure we are building everything
  delete opts.services;

  // Get opts
  var options = (opts) ? _.merge(defaults, opts) : defaults;

  // Return
  return {
    cmd: buildCmd(compose, project, 'build', options),
    opts: {app: opts.app, mode: 'collect'}
  };

};

/*
 * Run docker compose pull
 */
exports.pull = function(compose, project, opts) {

  // Let's get a list of all our services that need to be pulled
  // eg not built from a local dockerfile
  var images = _.filter(_.keys(_.get(opts, 'app.services'), []), function(service) {
    return !_.has(opts.app.services, service + '.build');
  });

  // If the user has selected something then intersect, if not use all image driven services
  opts.services = (!_.isEmpty(opts.services)) ? _.intersection(opts.services, images) : images;

  return {
    cmd: buildCmd(compose, project, 'pull', opts),
    opts: {app: opts.app, mode: 'collect'}
  };
};

/*
 * Run docker compose Kill
 * @NOTE: we use kill for speeeeeedzzz
 */
exports.stop = function(compose, project, opts) {
  return {
    cmd: buildCmd(compose, project, 'kill', opts),
    opts: {app: opts.app, mode: 'collect'}
  };
};

/*
 * Run docker compose run
 */
exports.run = function(compose, project, opts) {

  // Default options
  var defaults = {
    user: 'root'
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
  var options = (opts) ? _.merge(defaults, opts) : defaults;

  // Build the command
  return {
    cmd: buildCmd(compose, project, 'exec', options),
    opts: {app: opts.app, mode: 'attach'}
  };

};

/*
 * Run docker compose logs
 */
exports.logs = function(compose, project, opts) {

  // Default options
  var defaults = {
    follow: false,
    timestamps: false
  };

  // Get opts
  var options = (opts) ? _.merge(defaults, opts) : defaults;

  // Build the command
  return {
    cmd: buildCmd(compose, project, 'logs', options),
    opts: {app: opts.app, mode: 'attach'}
  };

};

/*
 * Run docker compose remove
 */
exports.remove = function(compose, project, opts) {

  // Default down options
  var defaultDowns = {
    removeOrphans: true,
    volumes: true
  };

  // Default rm options
  var defaultRms = {
    force: true,
    volumes: true
  };

  // Get opts
  var defaults = (opts.purge) ? defaultDowns : defaultRms;
  var options = (opts) ? _.merge(defaults, opts) : defaults;

  // Get subcommand
  var subCmd = (opts.purge) ? 'down' : 'rm';

  // Build the command and run it
  return {
    cmd: buildCmd(compose, project, subCmd, options),
    opts: {app: opts.app, mode: 'collect'}
  };

};
