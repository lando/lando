'use strict';

const bodyParser = require('body-parser');
const compression = require('compression');
const rewrite = require('express-urlrewrite');
const fs = require('fs');
const log = require('./lib/logger.js');
const path = require('path');
const Promise = require('bluebird');
const currentVersion = 'v1';

// Define default config
const defaultConfig = {
  'LANDO_API_PORT': 80,
  'LANDO_API_TIMEOUT': 10000,
};

// Get configuration
const config = require('./lib/config.js')(defaultConfig);
log.info('Starting app with config %j', config);

// Get the app ready
const express = require('express');
const api = express();

// App usage
api.use(compression());
api.use(bodyParser.urlencoded({extended: true}));
api.use(bodyParser.json());
api.use(rewrite('/*', `/${currentVersion}/$1`));

/**
 * Handler function.
 * @param {function} fn thing
 * @return {String} log shit
 */
const handler = fn => {
  // Returns a handler function.
  return (req, res) => {
    log.request(req, res);
    // Call fn in context of a promise.
    return Promise.try(fn, [req, res])
    // Make sure we have a timeout.
    .timeout(config.LANDO_API_TIMEOUT || 10 * 1000)
    // Handle success.
    .then(data => {
      res.status(200);
      res.json(data);
      res.end();
      log.response(res, 'info', data);
    })
    // Handler failure.
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

// Start listening
Promise.fromNode(cb => {
  api.listen(config.LANDO_API_PORT, cb);
})
// Load our routes
.then(() => {
  fs.readdirSync(path.join(__dirname, 'routes')).map(file => {
    require(`./routes/${file}`)(api, handler);
    log.info('Loaded route %s', file);
  });
  log.info('Listening on port: %s', config.LANDO_API_PORT);
});
