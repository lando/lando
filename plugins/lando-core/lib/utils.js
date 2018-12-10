'use strict';

// Modules
const _ = require('lodash');
const chalk = require('yargonaut').chalk();
const path = require('path');
const url = require('url');

/*
 * A toggle to either start or restart
 */
exports.appToggle = (app, toggle = 'start', table, header = '') => app[toggle]().then(() => {
  // Header it
  console.log(header);
  // Inject start table into the table
  _.forEach(exports.startTable(app), (value, key) => {
    const opts = (_.includes(key, 'urls')) ? {arrayJoiner: '\n'} : {};
    table.add(_.toUpper(key), value, opts);
  });
  // Print the table
  console.log(table.toString());
  console.log('');
});

/*
 * Returns a normal default interactive confirm with custom message
 */
exports.buildConfirm = (message = 'Are you sure?') => ({
  describe: 'Auto answer yes to prompts',
  alias: ['y'],
  default: false,
  boolean: true,
  interactive: {
    type: 'confirm',
    default: false,
    message: message,
  },
});

/*
 * Helper method to get the host part of a volume
 */
exports.getHostPath = mount => _.dropRight(mount.split(':')).join(':');

/*
 * Takes inspect data and extracts all the exposed ports
 */
exports.getUrls = data => _(_.merge(_.get(data, 'Config.ExposedPorts', []), {'443/tcp': {}}))
  .map((value, port) => ({port: _.head(port.split('/')), protocol: (port === '80/tcp') ? 'http' : 'https'}))
  .filter(exposed => _.includes(['443', '80'], exposed.port))
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
 * Helper method to normalize a path so that Lando overrides can be used as though
 * the docker-compose files were in the app root.
 */
exports.normalizePath = (local, base, excludes = []) => {
  // Return local if it starts with $
  if (_.startsWith(local, '$')) return local;
  // Return local if it is one of the excludes
  if (_.includes(excludes, local)) return local;
  // Return local if local is an absolute path
  if (path.isAbsolute(local)) return local;
  // Otherwise this is a relaive path so return local resolved by base
  return path.resolve(path.join(base, local));
};

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
  data.services = app.services;

  // Categorize and colorize URLS if and as appropriate
  _.forEach(app.info, info => {
    if (_.has(info, 'urls') && !_.isEmpty(info.urls)) {
      urls[info.service] = _.filter(app.urls, item => {
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
