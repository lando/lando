'use strict';

// Modules
var _ = require('lodash');
var chalk = require('yargonaut').chalk();
var fs = require('fs-extra');
var path = require('path');
var url = require('url');

/**
 * Checks if there is already an app with the same name in an app _registry
 * object
 *
 * @since 3.0.0
 * @alias 'lando.utils.app.appNameExists'
 */
exports.appNameExists = function(apps, app) {
  return _.some(apps, function(a) {
    return a.name === app.name;
  });
};

/**
 * Validates compose files returns legit ones
 *
 * @since 3.0.0
 * @alias 'lando.utils.app.validateFiles'
 */
exports.validateFiles = function(files, root) {

  // Handle args
  if (typeof files === 'string') {
    files = [files];
  }
  root = root || process.cwd();

  // Return a list of absolute paths that exists
  return _.compact(_.map(files, function(file) {

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

/**
 * Takes data and spits out a compose object
 *
 * @since 3.0.0
 * @alias 'lando.utils.app.compose'
 */
exports.compose = function(version, services, volumes, networks) {
  return {
    version: version,
    services: services,
    volumes: volumes,
    networks: networks
  };
};

/**
 * Returns a CLI table with app start metadata info
 *
 * @since 3.0.0
 * @alias 'lando.utils.app.startTable'
 */
exports.startTable = function(app) {

  // Spin up collectors
  var data = {};
  var urls = {};

  // Add generic data
  data.name = app.name;
  data.location = app.root;
  data.services = _.keys(app.services);

  // Categorize and colorize URLS if and as appropriate
  _.forEach(app.info, function(info, service) {
    if (_.has(info, 'urls') && !_.isEmpty(info.urls))  {
      urls[service] = _.filter(app.urls, function(item) {
        item.theme = chalk[item.color](item.url);
        return _.includes(info.urls, item.url);
      });
    }
  });

  // Add service URLS
  _.forEach(urls, function(items, service) {
    data[service + ' urls'] = _.map(items, 'theme');
  });

  // Return data
  return data;

};

/**
 * Takes inspect data and extracts all the exposed ports
 *
 * @since 3.0.0
 * @alias 'lando.utils.app.getUrls'
 */
exports.getUrls = function(data) {

  // Start a URL collector
  var urls = [];

  // Get the exposed ports
  var exposedPorts = _.get(data, 'Config.ExposedPorts', []);

  // Go through the exposed ports and find host port info
  _.forEach(exposedPorts, function(value, key) {

    // Only look at ports that are reliably HTTP/HTTPS addresses
    // @TODO: We do this so we aren't accidently pinging things like mysql
    if (key === '443/tcp' || key === '80/tcp') {

      // Get the host port data path
      var netPath = 'NetworkSettings.Ports.' + key;

      // Filter out only ports that are exposed to 0.0.0.0
      var onHost = _.filter(_.get(data, netPath, []), function(item) {
        return item.HostIp === '0.0.0.0';
      });

      // Map only the exposed ports and grab the first one
      _.forEach(_.map(onHost, 'HostPort'), function(port) {
        urls.push(url.format({
          protocol: (key === '443/tcp') ? 'https:' : 'http:',
          hostname: 'localhost',
          port: (port !== '80') ? port : ''
        }));
      });

    }

  });

  // Return
  return urls;

};

/**
 * Returns a default info object
 *
 * @since 3.0.0
 * @alias 'lando.utils.app.getInfoDefaults'
 */
exports.getInfoDefaults = function(app) {

  // Collect defaults
  var defaults = {};

  // Add a basic info object for each service
  _.forEach(_.keys(app.services), function(service) {
    defaults[service] = {urls: []};
  });

  // Return
  return defaults;

};


/**
 * Helper to parse metrics data
 *
 * @since 3.0.0
 * @alias 'lando.utils.app.metricsParse'
 */
exports.metricsParse = function(app) {

  // Metadata to report.
  var data = {
    app: _.get(app, 'id', 'unknown'),
    type: _.get(app, 'config.recipe', 'none')
  };

  // Build an array of services to send as well
  if (_.has(app, 'config.services')) {
    data.services = _.map(_.get(app, 'config.services'), function(service) {
      return service.type;
    });
  }

  // Get the email if there is one
  if (_.has(app, 'email')) {
    data.email = _.get(app, 'email');
  }

  // Return
  return data;

};
