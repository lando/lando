'use strict';

// Modules
const _ = require('lodash');
const copydir = require('copy-dir');
const fs = require('fs');
const mkdirp = require('mkdirp');
const parse = require('string-argv');
const path = require('path');
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
  .map(service => _.merge({}, service, _.find(app.info, {service: service.service})))
  .value();

/*
 * Helper to get globals
 */
exports.getGlobals = app => exports.toObject(app.services, {
  networks: {default: {}},
  environment: app.env,
  labels: app.labels,
  // @TODO: Is this too low a level to assume?
  volumes: [`${app.root}:/app`],
});

/*
 * Helper to find all our services
 */
exports.getServices = composeData => _(composeData)
  .flatMap(data => data.data)
  .flatMap(data => _.keys(data.services))
  .uniq()
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
  const filter = (stat, filepath, filename) => (path.extname(filename) !== '.js');
  // Ensure to exists
  mkdirp.sync(dest);
  // Try to copy the assets over
  try {
    copydir.sync(src, dest, filter);
  } catch (error) {
    const code = _.get(error, 'code');
    const syscall = _.get(error, 'syscall');
    const f = _.get(error, 'path');

    // Catch this so we can try to repair
    if (code !== 'EISDIR' || syscall !== 'open' || !!mkdirp.sync(f)) {
      throw new Error(error);
    }

    // Try to take corrective action
    fs.unlinkSync(f);
    copydir.sync(src, dest, filter);
  };

  // Return the new scripts directory
  return dest;
};

/*
 * Helper to properly escape and potentially wrap a command for use with shell.sh
 */
exports.shellEscape = (command, wrap = false) => {
  // Parse the command if its a string
  if (_.isString(command)) command = parse(command);
  // Wrap in shell if specified
  // @TODO: Is below actually a good list?
  if (wrap && !_.isEmpty(_.intersection(command, ['&', '&&', '|', '||', '<', '>', '$']))) {
    command = ['/bin/sh', '-c', command.join(' ')];
  }
  // Return
  return command;
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
exports.traverseUp = require('./bootstrap').traverseUp;

/*
 * Validates compose files returns legit ones
 */
exports.validateFiles = (files = [], root = process.cwd()) => _(files)
  .map(file => (path.isAbsolute(file) ? file : path.join(root, file)))
  .filter(file => fs.existsSync(file))
  .value();
