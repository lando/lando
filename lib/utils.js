'use strict';

// Modules
const _ = require('lodash');
const chalk = require('yargonaut').chalk();
const fs = require('fs-extra');
const path = require('path');
const Promise = require('./promise');
const Shell = require('./shell');
const shell = new Shell();
const url = require('url');

/*
 * Checks if there is already an app with the same name in an app _registry
 * object
 */
exports.appNameExists = (apps, app) => _.some(apps, a => a.name === app.name);

/*
 * Validates compose files returns legit ones
 */
exports.validateFiles = (files, root) => {
  // Handle args
  if (typeof files === 'string') {
    files = [files];
  }
  root = root || process.cwd();

  // Return a list of absolute paths that exists
  return _.compact(_.map(files, file => {
    // Check if absolute
    if (!path.isAbsolute(file)) {
      file = path.join(root, file);
    }
    // Check existence
    if (fs.existsSync(file)) {
      return file;
    }
  }));
};

/*
 * Takes data and spits out a compose object
 */
exports.compose = (version, services, volumes, networks) => ({
  version: version,
  services: services,
  volumes: volumes,
  networks: networks,
});

/*
 * Returns a CLI table with app start metadata info
 */
exports.startTable = app => {
  // Spin up collectors
  const data = {};
  const urls = {};

  // Add generic data
  data.name = app.name;
  data.location = app.root;
  data.services = _.keys(app.services);

  // Categorize and colorize URLS if and as appropriate
  _.forEach(app.info, (info, service) => {
    if (_.has(info, 'urls') && !_.isEmpty(info.urls)) {
      urls[service] = _.filter(app.urls, item => {
        item.theme = chalk[item.color](item.url);
        return _.includes(info.urls, item.url);
      });
    }
  });

  // Add service URLS
  _.forEach(urls, (items, service) => {
    data[service + ' urls'] = _.map(items, 'theme');
  });

  // Return data
  return data;
};

/*
 * Takes inspect data and extracts all the exposed ports
 */
exports.getUrls = data => {
  // Start a URL collector
  const urls = [];

  // Get the exposed ports
  const exposedPorts = _.get(data, 'Config.ExposedPorts', []);

  // Go through the exposed ports and find host port info
  _.forEach(exposedPorts, (value, key) => {
    // Only look at ports that are reliably HTTP/HTTPS addresses
    // @TODO: We do this so we aren't accidently pinging things like mysql
    if (key === '443/tcp' || key === '80/tcp') {
      // Get the host port data path
      const netPath = 'NetworkSettings.Ports.' + key;
      // Filter out only ports that are exposed to 0.0.0.0
      const onHost = _.filter(_.get(data, netPath, []), item => item.HostIp === '0.0.0.0');
      // Map only the exposed ports and grab the first one
      _.forEach(_.map(onHost, 'HostPort'), port => {
        urls.push(url.format({
          protocol: (key === '443/tcp') ? 'https:' : 'http:',
          hostname: 'localhost',
          port: (port !== '80') ? port : '',
        }));
      });
    }
  });

  // Return
  return urls;
};

/*
 * Returns a default info object
 */
exports.getInfoDefaults = app => {
  // Collect defaults
  const defaults = {};
  // Add a basic info object for each service
  _.forEach(_.keys(app.services), service => {
    defaults[service] = {urls: []};
  });
  // Return
  return defaults;
};


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
    app: (special !== 'TRUE') ? app : undefined,
    kind: (special !== 'TRUE') ? 'app' : 'service',
    lando: (lando === 'TRUE') ? true : false,
    instance: Labels['io.lando.id'] || 'unknown',
  };
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
