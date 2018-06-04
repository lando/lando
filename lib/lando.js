'use strict';

// Modules
let _ = require('lodash');
let AsyncEvents = require('./events');
let Cache = require('./cache');
let Log = require('./logger');
let Metrics = require('./metrics');
let Plugins = require('./plugins');
let path = require('path');
let UpdateManager = require('./updates');

/*
 * Return lando
 */
module.exports = _.memoize(function(config) {
  // Instantiate a logger so we can set it here and inject it into our
  // other modules as needed
  let log = new Log(config);

  // Cache config
  let cacheConfig = {
    log: log,
    cacheDir: path.join(config.userConfRoot, 'cache'),
  };

  // Metrics config
  let metricsConfig = {
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
    },
  };

  // Event setup
  let events = new AsyncEvents(log);

  // Messaging function
  let message = function(data) {
    let defaults = {context: 'core', type: 'info'};
    return events.emit('message', _.merge(defaults, data));
  };

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
    plugins: new Plugins(log),
    Promise: require('./promise'),
    scanUrls: require('./scan')(log),
    shell: require('./shell')(log),
    tasks: require('./tasks'),
    updates: new UpdateManager(),
    user: require('./user'),
    utils: {config: require('./config')},
    yaml: require('./yaml')(log),
  };
});
