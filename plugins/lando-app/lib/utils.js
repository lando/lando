'use strict';

// Modules
const _ = require('lodash');
const chalk = require('yargonaut').chalk();
const fs = require('fs-extra');
const path = require('path');
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
