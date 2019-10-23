'use strict';

var _ = require('lodash');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var Db = require('./elastic.js');
var VError = require('verror');

/*
 * Helper to load the config things
 */
var getConfig = function() {

  // Start with defualts
  var config = {
    'LANDO_METRICS_PORT': 80,
    'LANDO_METRICS_TIMEOUT': 10000,
    'LANDO_METRICS_BUGSNAG': {},
    'LANDO_METRICS_ELASTIC': {}
  };

  // Merge in .env file
  require('dotenv').config();

  // Merge in process.env as relevant
  _.forEach(_.keys(config), function(key) {
    if (_.has(process.env, key)) {
      config[key] = process.env[key];
    }
  });

  // Merge in platformsh stuff
  if (!_.isEmpty(process.env.PLATFORM_ENVIRONMENT)) {

    // Get platform config
    var pconfig = require('platformsh').config();

    // Load in platform vars
    if (!_.isEmpty(pconfig.variables)) {
      _.forEach(pconfig.variables, function(value, key) {
        config[key] = value;
      });
    }

    // Set the port
    config.LANDO_METRICS_PORT = pconfig.port;

  }

  // Make sure we JSON parse relevant config
  _.forEach(['LANDO_METRICS_BUGSNAG', 'LANDO_METRICS_ELASTIC'], function(key) {
    if (typeof config[key] === 'string') {
      config[key] = JSON.parse(config[key]);
    }
  });

  // Return config
  return config;

};

// Load .env file
require('dotenv').config();

/*
 * Use json body parser plugin.
 */
app.use(bodyParser.json());

/*
 * Logging function.
 */
function log() {
  return console.log.apply(this, _.toArray(arguments));
}

/*
 * Lazy load bugsnag module.
 */
var bugsnag = _.once(function() {
  return require('./bugsnag.js')(getConfig().LANDO_METRICS_BUGSNAG);
});

/*
 * Pretty print function.
 */
function pp(obj) {
  return JSON.stringify(obj);
}

/*
 * Get a db connection, will dispose itself.
 */
function db() {
  // Use this ref for disposing.
  var instance = null;
  // Create db connection.
  return Promise.try(function() {
    instance = new Db(getConfig().LANDO_METRICS_ELASTIC);
    return instance;
  })
  // Wrap errors.
  .catch(function(err) {
    throw new VError(
      err,
      'Error connecting to database: %s',
      pp(getConfig().LANDO_METRICS_ELASTIC)
    );
  })
  // Make sure to close connection.
  .disposer(function() {
    if (instance) {
      instance.close();
    }
  });
}

/*
 * Helper function for mapping promise to response.
 */
function handle(fn) {
  // Returns a handler function.
  return function(req, res) {
    // Call fn in context of a promise.
    return Promise.try(fn, [req, res])
    // Make sure we have a timeout.
    .timeout(getConfig().LANDO_METRICS_TIMEOUT || 10 * 1000)
    // Handler failure.
    .catch(function(err) {
      console.log(err.message);
      console.log(err.stack);
      res.status(500);
      res.json({status: {err: 'Unexected server error.'}});
      res.end();
    })
    // Handle success.
    .then(function(data) {
      res.status(200);
      res.json(data);
      res.end();
    });
  };
}

/*
 * Respond to status pings.
 */
app.get('/status', handle(function(req, res) {
  var result = {status: 'OK'};
  log(JSON.stringify(result));
  return result;
}));

/*
 * Sanity check.
 */
app.get('/', handle(function(req, res) {
  var result = {status: 'THING'};
  log(JSON.stringify(result));
  return result;
}));

/*
 * Post new meta data for metrics.
 */
app.post('/metrics/v2/:id', handle(function(req, res) {

  var data = req.body;
  data.instance = req.params.id;

  return Promise.all([
    // Insert into database.
    Promise.using(db(), function(db) {
      return db.insert(data);
    }),
    // Report to bugsnag.
    bugsnag().report(data)
  ])
  .return({status: 'OK'});
}));

Promise.fromNode(function(cb) {
  app.listen(getConfig().LANDO_METRICS_PORT, cb);
})
.then(function() {
  log('Listening on port: %s', getConfig().LANDO_METRICS_PORT);
});
