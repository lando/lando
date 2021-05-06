'use strict';

const _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const log = require('./lib/logger.js');
const path = require('path');
const Promise = require('bluebird');

// TEST2

// Define default config
const defaultConfig = {
  // The name should match with the file in `plugins/NAME.js`
  // The config (eg config.LANDO_METRICS_ELASTIC) to instantiate the plugin
  'LANDO_METRICS_PLUGINS': [
    {name: 'elastic', config: 'LANDO_METRICS_ELASTIC'},
    {name: 'bugsnag', config: 'LANDO_METRICS_BUGSNAG'},
  ],
  'LANDO_METRICS_PORT': 80,
  'LANDO_METRICS_TIMEOUT': 10000,
};

// Get configuration
const config = require('./lib/config.js')(defaultConfig);
log.info('Starting app with config %j', config);

// Iterate through plugins and build list of reporters
const plugins = _(config.LANDO_METRICS_PLUGINS)
  .map(plugin => _.merge({}, plugin, {path: path.resolve(__dirname, 'plugins', `${plugin.name}.js`)}))
  .filter(plugin => fs.existsSync(plugin.path))
  .map(plugin => _.merge({}, plugin, {Reporter: require(plugin.path)}))
  .value();
log.info('Loaded plugins %j', plugins);

// Get the app ready
const express = require('express');
const api = express();
// App usage
api.use(bodyParser.json());

/**
 * handlerr function.
 * @param {function} fn thing
 * @return {String} log shit
 */
const handler = fn => {
  // Returns a handlerr function.
  return (req, res) => {
    log.request(req, res);
    // Call fn in context of a promise.
    return Promise.try(fn, [req, res])
    // Make sure we have a timeout.
    .timeout(config.LANDO_METRICS_TIMEOUT || 10 * 1000)
    // handler success.
    .then(data => {
      res.status(200);
      res.json(data);
      res.end();
      log.response(res, 'info', data);
    })
    // handlerr failure.
    .catch(err => {
      const code = err.statusCode || err.status || 500;
      const message = err.message || err.statusMessage || 'Unknown Error';
      res.status(code);
      res.send({code, message});
      res.end();
      log.response(res, 'error', err);
    });
  };
};

/*
 * Respond to status pings and sanity checks.
 */
api.get('/status', handler((req, res) => ({status: 'OK'})));
api.get('/ping', handler((req, res) => ({status: 'pong'})));
api.get('/', handler((req, res) => ({ping: 'pong'})));

/*
 * Post new meta data for metrics.
 */
api.post('/metrics/v2/:id', handler((req, res) => {
  return Promise.map(plugins, plugin => {
    const reporter = new plugin.Reporter(config[plugin.config]);
    return reporter.ping()
      .then(() => reporter.report(_.merge({}, req.body, {instance: req.params.id})))
      .then(() => log.info('Reported to %s', plugin.name))
      .then(() => reporter.close());
  });
}));

// Main logix
Promise.fromNode(cb => {
  api.listen(config.LANDO_METRICS_PORT, cb);
})
.then(() => {
  log.info('Listening on port: %s', config.LANDO_METRICS_PORT);
});
