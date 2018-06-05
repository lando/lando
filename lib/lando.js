'use strict';

// Modules
const _ = require('lodash');
const AsyncEvents = require('./events');
const Cache = require('./cache');
const Log = require('./logger');
const Metrics = require('./metrics');
const Plugins = require('./plugins');
const path = require('path');
const UpdateManager = require('./updates');

/*
 * Return lando
 */
module.exports = _.memoize(config => {
  // Instantiate a logger so we can set it here and inject it into our
  const log = new Log(config);
  // Cache config
  const cacheConfig = {log, cacheDir: path.join(config.userConfRoot, 'cache')};
  // Metrics config
  const metricsConfig = {
    log,
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
  const events = new AsyncEvents(log);
  // Messaging function
  const message = data => events.emit('message', _.merge({context: 'core', type: 'info'}, data));

  // Return the lando object
  return {
    cache: new Cache(cacheConfig),
    cli: require('./cli'),
    config,
    events,
    log,
    message,
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
