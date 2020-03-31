'use strict';

const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const fs = require('fs');
const log = require('./lib/logger.js');
const path = require('path');
const Promise = require('bluebird');
const SlackNotify = require('./lib/slack');

// Define default config
const defaultConfig = {
  'LANDO_API_PORT': 80,
  'LANDO_API_TIMEOUT': 10000,
  'LANDO_API_ALLOWED_ORIGINS': [
    /https:\/\/([a-z0-9]+[.])*lando[.]dev/,
    /https:\/\/([a-z0-9]+[.])*lndo[.]site/,
    /https?:\/\/([a-z0-9]+[.])*iaimrn624qfk6[.]us[.]platform[.]sh/,
  ],
  'LANDO_API_GITHUB_TOKEN': null,
  'LANDO_API_GITHUB_SECRET': null,
  'LANDO_API_MAILCHIMP_KEY': null,
  'LANDO_API_SLACK_SPONSOR_WEBHOOK': null,
  'LANDO_API_SLACK_NOEMAIL_WEBHOOK': null,
  'LANDO_API_SLACK_API_WEBHOOK': null,
};

// Get configuration
const config = require('./lib/config.js')(defaultConfig);
log.info('Starting app with config %j', config);

// Warn if we don't have a set mailchimp get
if (!config.LANDO_API_MAILCHIMP_KEY) {
  log.error('LANDO_API_MAILCHIMP_KEY is not set!');
}

// Get the app ready
const express = require('express');
const api = express();

// App usage
api.use(compression());
api.use(cors({origin: defaultConfig.LANDO_API_ALLOWED_ORIGINS}));
api.use(bodyParser.urlencoded({extended: true}));
api.use(bodyParser.json());

// Instantiate helperz
const slack = new SlackNotify(config.LANDO_API_SLACK_API_WEBHOOK, config.LANDO_API_SLACK_SPONSOR_WEBHOOK);

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
      const code = err.statusCode || err.status || err.code || 500;
      const message = err.message || err.statusMessage || 'Unknown Error';
      slack.apiError({code, message, body: req.body});
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
    require(`./routes/${file}`)(api, handler, {config, slack});
    log.info('Loaded route %s', file);
  });
  log.info('Listening on port: %s', config.LANDO_API_PORT);
});
