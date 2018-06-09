'use strict';

// Modules
const _ = require('lodash');
const AsyncEvents = require('./events');
const Cache = require('./cache');
const Cli = require('./cli');
const ErrorHandler = require('./error');
const Log = require('./logger');
const Metrics = require('./metrics');
const Plugins = require('./plugins');
const path = require('path');
const random = require('uuid/v4');
const Shell = require('./shell');
const UpdateManager = require('./updates');
const Yaml = require('./yaml');

/*
 * Return lando
 */
module.exports = _.memoize(config => {
  // Instantiate things we need right now
  const log = new Log(config);
  const cache = new Cache({log, cacheDir: path.join(config.userConfRoot, 'cache')});

  // Make sure we have an id
  if (!cache.get('id')) cache.set('id', random(), {persist: true});
  // Set the id into the config
  config.user = cache.get('id');
  config.id = config.user;

  // Metrics config
  const metricsConfig = {
    log,
    id: config.id,
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
  const metrics = new Metrics(metricsConfig);

  // Event setup
  const events = new AsyncEvents(log);

  // Messaging function
  const message = data => events.emit('message', _.merge({context: 'core', type: 'info'}, data));

  // Return the lando object
  return {
    cache,
    cli: new Cli(),
    config,
    error: new ErrorHandler(log, metrics),
    events,
    log,
    message,
    metrics,
    node: require('./node'),
    plugins: new Plugins(log),
    Promise: require('./promise'),
    scanUrls: require('./scan')(log),
    shell: new Shell(log),
    tasks: require('./tasks'),
    updates: new UpdateManager(),
    user: require('./user'),
    utils: {config: require('./config')},
    yaml: new Yaml(log),
  };
});
