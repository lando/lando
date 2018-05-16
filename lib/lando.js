'use strict';

// Modules
var _ = require('lodash');
var AsyncEvents = require('./events');
var Cache = require('./cache');
var Log = require('./logger');
var Metrics = require('./metrics');
var path = require('path');

/*
 * Return lando
 */
module.exports = _.memoize(function(config) {

  // Instantiate a logger so we can set it here and inject it into our
  // other modules as needed
  var log = new Log(config);

  // Cache config
  var cacheConfig = {
    log: log,
    cacheDir: path.join(config.userConfRoot, 'cache')
  };

  // Metrics config
  var metricsConfig = {
    log: log,
    idDir: config.userConfRoot,
    endpoints: config.stats,
    data: {
      devMode: false,
      nodeVersion: process.version,
      mode: config.mode || 'unknown',
      os: config.os,
      product: config.product,
      version: config.version,
    }
  };

  // Event setup
  var events = new AsyncEvents(log);

  // Messaging function
  var message = function(data) {
    var defaults = {context: 'core', type: 'info'};
    return events.emit('message', _.merge(defaults, data));
  };

  // @TODO: Get a Real IOC container!
  var UpdateManager = require('./updates');
  // Return the lando object
  return {
    cache: new Cache(cacheConfig),
    cli: require('./cli'),
    config: config,
    events: events,
    log: log,
    message: message,
    metrics: new Metrics(metricsConfig),
    node: require('./node'),
    plugins: require('./plugins')(log),
    Promise: require('./promise'),
    scanUrls: require('./scan')(log),
    shell: require('./shell')(log),
    tasks: require('./tasks'),
    updates: new UpdateManager(),
    user: require('./user'),
    utils: {config: require('./config')},
    yaml: require('./yaml')(log)
  };

});
