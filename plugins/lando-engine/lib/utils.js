'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('./../../../lib/promise');
const Shell = require('./../../../lib/shell');
const shell = new Shell();

/*
 * Translate a name for use by docker-compose eg strip `-` and `.` and
 * @TODO: Eventually we want to get rid of this since it should only happen once
 * on the appName itself
 */
exports.dockerComposify = data => _.toLower(data).replace(/_|-|\.+/g, '');

/*
 * Escapes any spaces in a command.
 */
exports.escSpaces = shell.escSpaces;

/*
 * Helper to return a valid id from app data
 */
exports.getId = c => c.cid || c.id || c.containerName || c.containerID || c.name;

/*
 * Extracts some docker inspect data and translates it into useful lando things
 */
exports.toLandoContainer = dockerContainer => {
  // Get name of docker container.
  const app = dockerContainer.Labels['com.docker.compose.project'];
  const service = dockerContainer.Labels['com.docker.compose.service'];
  const num = dockerContainer.Labels['com.docker.compose.container-number'];
  const run = dockerContainer.Labels['com.docker.compose.oneoff'];
  const lando = dockerContainer.Labels['io.lando.container'] || false;
  const special = dockerContainer.Labels['io.lando.service-container'] || false;
  const id = dockerContainer.Labels['io.lando.id'] || 'unknown';

  // Add 'run' the service if this is a oneoff container
  if (run === 'True') service = [service, 'run'].join('_');

  // Make sure we have a boolean
  const isSpecial = (special === 'TRUE') ? true : false;

  // Build generic container.
  return {
    id: dockerContainer.Id,
    service: service,
    name: [app, service, num].join('_'),
    app: (!isSpecial) ? app : undefined,
    kind: (!isSpecial) ? 'app' : 'service',
    lando: (lando === 'TRUE') ? true : false,
    instance: id,
  };
};

/*
 * We might have datum but we need to wrap in array so Promise.each knows
 * what to do
 */
exports.normalizer = data => (!_.isArray(data)) ? [data] : data;

/*
 * Helper to move config from lando to a mountable directory
 */
exports.moveConfig = (src, dest) => {
   // Copy opts and filter out all js files
   // We dont want to give the false impression that you can edit the JS
   const copyOpts = {
     overwrite: true,
     filter: function(file) {
       return (path.extname(file) !== '.js');
     },
   };

   // Ensure to exists
   fs.mkdirpSync(dest);

   // Try to copy the assets over
   try {
     fs.copySync(src, dest, copyOpts);
   } catch (error) {
     const code = _.get(error, 'code');
     const syscall = _.get(error, 'syscall');
     const f = _.get(error, 'path');

     // Catch this so we can try to repair
     if (code !== 'EISDIR' || syscall !== 'open' || !!fs.mkdirpSync(f)) {
       throw new Error(error);
     }

     // Try to take corrective action
     fs.unlinkSync(f);
     fs.copySync(src, dest, copyOpts);
   };

   // Return the new scripts directory
   return dest;
 };

/*
 * Helper to handle docker run config
 * @todo: this needs to be better
 */
exports.runConfig = (cmd, opts = {}) => {
  // Discover the mode
  const mode = (opts.mode) ? opts.mode : 'collect';
  const defaultTty = true;
  // Force some things things if we are in a non node context
  if (process.lando !== 'node') {
    mode = 'collect';
    defaultTty = false;
  }

  // Make cmd is an array lets desconstruct and escape
  if (_.isArray(cmd)) cmd = shell.escSpaces(shell.esc(cmd), 'linux');
  // Add in any prefix commands
  if (_.has(opts, 'pre')) cmd = [opts.pre, cmd].join('&&');

  // Build the exec opts
  const execOpts = {
    AttachStdin: opts.attachStdin || false,
    AttachStdout: opts.attachStdout || true,
    AttachStderr: opts.attachStderr || true,
    Cmd: ['/bin/sh', '-c', cmd],
    Env: opts.env || [],
    DetachKeys: opts.detachKeys || 'ctrl-p,ctrl-q',
    Tty: opts.tty || defaultTty,
    User: opts.user || 'root',
  };

  // Start opts
  const startOpts = {
    hijack: opts.hijack || false,
    stdin: execOpts.AttachStdin,
    Detach: false,
    Tty: defaultTty,
  };

  // Force attach stdin if we are in attach mode
  if (mode === 'attach') execOpts.AttachStdin = true;

  return {execOpts, startOpts};
};

/*
 * Helper to handle docker run stream
 * @todo: this needs to be better
 */
exports.runStream = (stream, mode = 'collect') => {
  // Pipe stream to nodes process
  stream.pipe(process.stdout);

  // Attaching mode handling
  if (mode === 'attach') {
    // Set a more realistic max listeners considering what we are doing here
    process.stdin._maxListeners = 15;
    // Restart stdin with correct encoding
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    // Make sure rawMode matches up
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
    // Send our processes stdin into the container
    process.stdin.pipe(stream);
  }

  // Promise in the stream
  return new Promise(resolve => {
    let stdout = '';
    let stderr = '';
    // Collect the buffer if in collect mode
    stream.on('data', buffer => {
      stdout = stdout + String(buffer);
    });
    // Collect the errorz
    stream.on('error', buffer => {
      stderr = stderr + String(buffer);
    });
    // Close the stream
    stream.on('end', () => {
      // If we were attached to our processes stdin then close that down
      if (mode === 'attach') {
        if (process.stdin.setRawMode) process.stdin.setRawMode(false);
        process.stdin.pause();
      }
      // Resolve
      resolve({stdout, stderr});
    });
  });
};
