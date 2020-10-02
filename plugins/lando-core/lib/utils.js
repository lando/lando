'use strict';

// Modules
const _ = require('lodash');
const chalk = require('chalk');
const path = require('path');
const url = require('url');

/*
 * Helper method to get the host part of a volume
 */
exports.getHostPath = mount => _.dropRight(mount.split(':')).join(':');

/*
 * Takes inspect data and extracts all the exposed ports
 */
exports.getUrls = (data, scan = ['80, 443'], secured = ['443'], bindAddress = '127.0.0.1') => {
  return _(_.merge(_.get(data, 'Config.ExposedPorts', []), {'443/tcp': {}}))
  .map((value, port) => ({
    port: _.head(port.split('/')),
    protocol: (_.includes(secured, port.split('/')[0])) ? 'https' : 'http'}
  ))
  .filter(exposed => _.includes(scan, exposed.port))
  .flatMap(ports => _.map(_.get(data, `NetworkSettings.Ports.${ports.port}/tcp`, []), i => _.merge({}, ports, i)))
  .filter(ports => _.includes([bindAddress, '0.0.0.0'], ports.HostIp))
  .map(ports => url.format({
    protocol: ports.protocol,
    hostname: 'localhost',
    port: _.includes(scan, ports.port) ? ports.HostPort : '',
  }))
  .thru(urls => ({service: data.Config.Labels['com.docker.compose.service'], urls}))
  .value();
};

/*
 * Helper method to normalize a path so that Lando overrides can be used as though
 * the docker-compose files were in the app root.
 */
exports.normalizePath = (local, base = '.', excludes = []) => {
  // Return local if it starts with $ or ~
  if (_.startsWith(local, '$') || _.startsWith(local, '~')) return local;
  // Return local if it is one of the excludes
  if (_.includes(excludes, local)) return local;
  // Return local if local is an absolute path
  if (path.isAbsolute(local)) return local;
  // Otherwise this is a relaive path so return local resolved by base
  return path.resolve(path.join(base, local));
};

/*
 * Helper to normalize overrides
 */
exports.normalizeOverrides = (overrides, base = '.', volumes = {}) => {
  // Normalize any build paths
  if (_.has(overrides, 'build')) {
    if (_.isObject(overrides.build) && _.has(overrides, 'build.context')) {
      overrides.build.context = exports.normalizePath(overrides.build.context, base);
    } else {
      overrides.build = exports.normalizePath(overrides.build, base);
    }
  }
  // Normalize any volumes
  if (_.has(overrides, 'volumes')) {
    overrides.volumes = _.map(overrides.volumes, volume => {
      if (!_.includes(volume, ':')) {
        return volume;
      } else {
        const local = exports.getHostPath(volume);
        const remote = _.last(volume.split(':'));
        // @TODO: I don't think below does anything?
        const excludes = _.keys(volumes).concat(_.keys(volumes));
        const host = exports.normalizePath(local, base, excludes);
        return [host, remote].join(':');
      }
    });
  }
  return overrides;
};

/*
 * Returns a CLI table with app start metadata info
 */
exports.startTable = app => {
  const data = {
    name: app.name,
    location: app.root,
    services: _(app.info)
      .map(info => (info.healthy) ? chalk.green(info.service) : chalk.yellow(info.service))
      .values()
      .join(', '),
  };
  const urls = {};

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

/*
 * Helper to strip the patch version
 */
exports.stripPatch = version => _.slice(version.split('.'), 0, 2).join('.');

/*
 * Helper to help us allow wildcard patch versions eg when there is no minor version tag available
 */
exports.stripWild = versions => _(versions)
  .map(version => (version.split('.')[2] === 'x') ? _.slice(version.split('.'), 0, 2).join('.') : version)
  .value();
