'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('./promise');
const Shell = require('./shell');
const shell = new Shell();
const url = require('url');
const Yaml = require('./yaml');
const yaml = new Yaml();

/*
 * Translate a name for use by docker-compose eg strip `-` and `.` and
 * @TODO: Eventually we want to get rid of this since it should only happen once
 * on the appName itself
 */
exports.dockerComposify = data => _.toLower(data).replace(/_|-|\.+/g, '');

/*
 * Helper to dump all our compose data to files
 */
exports.dumpComposeData = (data, dir) => _(_.flatten([data]))
  .flatMap(group => _.map(group.data, (compose, index) => ({data: compose, file: `${group.id}-${index}.yml`})))
  .map(compose => yaml.dump(path.join(dir, compose.file), compose.data))
  .value();

/*
 * Escapes any spaces in a command.
 */
exports.escSpaces = shell.escSpaces;

/*
 * Helper to load raw docker compose files
 */
exports.loadComposeFiles = (files, dir) => _(exports.validateFiles(files, dir))
  .map(file => yaml.load(file))
  .value();

/*
 * Helper to return a valid id from app data
 */
exports.getId = c => c.cid || c.id || c.containerName || c.containerID || c.name;

/*
 * Returns a default info object
 */
exports.getInfoDefaults = app => _(app.services)
  .map(service => ({service, urls: [], type: 'docker-compose'}))
  .value();

/*
 * Takes inspect data and extracts all the exposed ports
 */
exports.getUrls = data => _(_.merge(_.get(data, 'Config.ExposedPorts', []), {'443/tcp': {}}))
  .map((value, port) => ({port: _.head(port.split('/')), protocol: (port === '80/tcp') ? 'http' : 'https'}))
  .filter(exposed => !_.includes(['443', '80'], exposed.ports))
  .flatMap(ports => _.map(_.get(data, `NetworkSettings.Ports.${ports.port}/tcp`, []), i => _.merge({}, ports, i)))
  .filter(ports => ports.HostIp === '0.0.0.0')
  .map(ports => url.format({
    protocol: ports.protocol,
    hostname: 'localhost',
    port: _.includes(['443', '80'], ports.port) ? ports.HostPort : '',
  }))
  .thru(urls => ({service: data.Config.Labels['com.docker.compose.service'], urls}))
  .value();

/*
 * Helper to parse metrics data
 */
exports.metricsParse = app => {
  // Metadata to report.
  const data = {
    app: _.get(app, 'id', 'unknown'),
    type: _.get(app, 'config.recipe', 'none'),
  };

  // Build an array of services to send as well
  if (_.has(app, 'config.services')) {
    data.services = _.map(_.get(app, 'config.services'), service => service.type);
  }

  // Get the email if there is one
  if (_.has(app, 'email')) {
    data.email = _.get(app, 'email');
  }

  // Return
  return data;
};

/*
 * We might have datum but we need to wrap in array so Promise.each knows
 * what to do
 */
exports.normalizer = data => (!_.isArray(data)) ? [data] : data;

/*
 * Helper to make a file executable
 */
exports.makeExecutable = (files, base = process.cwd()) => {
  _.forEach(files, file => {
    fs.chmodSync(path.join(base, file), '755');
  });
};

/*
 * Helper to move config from lando to a mountable directory
 */
exports.moveConfig = (src, dest) => {
  // Copy opts and filter out all js files
  // We dont want to give the false impression that you can edit the JS
  const copyOpts = {
    overwrite: true,
    filter: file => (path.extname(file) !== '.js'),
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
 */
exports.runConfig = (cmd, {pre, env = [], user = 'root', detach = false} = {}, mode = 'collect') => {
  // Force some things things if we are in a non node context
  if (process.lando !== 'node') mode = 'collect';
  // Make cmd is an array lets desconstruct and escape
  if (_.isArray(cmd)) cmd = shell.escSpaces(shell.esc(cmd), 'linux');
  // Add in any prefix commands
  if (!_.isEmpty(pre)) cmd = [pre, cmd].join('&&');

  // Build the exec opts
  const execOpts = {
    AttachStdin: mode === 'attach',
    AttachStdout: true,
    AttachStderr: true,
    Cmd: ['/bin/sh', '-c', cmd],
    Env: env,
    DetachKeys: 'ctrl-p,ctrl-q',
    Tty: process.lando === 'node',
    User: user,
  };
  // Start opts
  const startOpts = {
    hijack: false,
    stdin: execOpts.AttachStdin,
    Detach: detach,
    Tty: execOpts.Tty,
  };

  return {execOpts, startOpts, attached: execOpts.AttachStdin};
};

/*
 * Helper to handle docker run stream
 */
exports.runStream = (stream, attached = false) => {
  // Pipe stream to nodes process
  stream.pipe(process.stdout);

  // Attaching mode handling
  if (attached) {
    // Set a more realistic max listeners considering what we are doing here
    process.stdin._maxListeners = 15;
    // Restart stdin with correct encoding
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    // Make sure rawMode matches up
    if (process.stdin.setRawMode) process.stdin.setRawMode(true);
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
      if (attached) {
        if (process.stdin.setRawMode) process.stdin.setRawMode(false);
        process.stdin.pause();
      }
      // Resolve
      resolve({stdout, stderr});
    });
  });
};

/*
 * Extracts some docker inspect data and translates it into useful lando things
 */
exports.toLandoContainer = ({Labels, Id}) => {
  // Get name of docker container.
  const app = Labels['com.docker.compose.project'];
  const service = Labels['com.docker.compose.service'];
  const num = Labels['com.docker.compose.container-number'];
  const run = Labels['com.docker.compose.oneoff'];
  const lando = Labels['io.lando.container'];
  const special = Labels['io.lando.service-container'];

  // Add 'run' the service if this is a oneoff container
  if (run === 'True') service = [service, 'run'].join('_');

  // Build generic container.
  return {
    id: Id,
    service: service,
    name: [app, service, num].join('_'),
    app: (special !== 'TRUE') ? app : '_global_',
    src: Labels['io.lando.src'] || 'unknown',
    kind: (special !== 'TRUE') ? 'app' : 'service',
    lando: (lando === 'TRUE') ? true : false,
    instance: Labels['io.lando.id'] || 'unknown',
  };
};

/*
 * Helper to build an obkect from an array of keys and data
 */
exports.toObject = (keys, data = {}) => _(keys)
  .map(service => data)
  .map((service, index) => _.set({}, keys[index], service))
  .thru(services => _.reduce(services, (sum, service) => _.merge(sum, service), {}))
  .value();

/*
 * Helper to traverse up directories from a start point
 */
exports.traverseUp = file => _(_.range(path.dirname(file).split(path.sep).length))
  .map(end => _.dropRight(path.dirname(file).split(path.sep), end).join(path.sep))
  .map(dir => path.join(dir, path.basename(file)))
  .value();

/*
 * Validates compose files returns legit ones
 */
exports.validateFiles = (files = [], root = process.cwd()) => _(files)
  .map(file => (path.isAbsolute(file) ? file : path.join(root, file)))
  .filter(file => fs.existsSync(file))
  .value();
