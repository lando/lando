'use strict';

var _ = require('lodash');
var Client = require('kalabox-stats-client').Client;
var fs = require('fs-extra');
var Log = require('./logger');
var os = require('os');
var path = require('path');
var Promise = require('./promise');
var random = require('uuid/v4');

/*
 * Get the metrics ID for this lando instance.
 */
var getId = function(idFile) {

  // Read ID file.
  return Promise.fromNode(function(cb) {
    fs.readFile(idFile, {encoding: 'utf8'}, cb);
  })

  // File does not exist.
  .catch(function(err) {
    if (err.code === 'ENOENT') {
      // IF file doesn't exist just return null.
      return null;
    }
    throw err;
  })

  // If ID file doesn't exist, get new ID from REST API and write ID file.
  .then(function(id) {
    if (id) {
      return id;
    }
    else {
      id = random();
      // Write new ID to ID file.
      return Promise.fromNode(function(cb) {
        fs.writeFile(idFile, id, cb);
      })
      // Return id.
      .return(id);
    }
  });

};

/**
 * Creates a new Metrics thing.
 *
 * @class Metrics
 * @classdec Builds a metrics instance.
 */
function Metrics(opts) {

  opts = opts || {};

  // Use opts or defaults
  this.log = opts.log || new Log();
  this.idFilename = opts.idFilename || '.instance.id';
  this.idDir = opts.idDir || path.join(os.tmpdir());
  this.endpoints = opts.endpoints || [];

  // Set idpath
  this.idFile = path.join(this.idDir, this.idFilename);

  // Default metadata to add to all our reports
  this.data = opts.data || {};

}

/**
 * Report meta data for metrics.
 * @memberof metrics
 */
Metrics.prototype.report = function(action, data) {

  // Get the log
  var log = this.log;
  var idFile = this.idFile;

  // Build the send object
  var send = _.merge(this.data, data || {});

  // Set the action
  send.action = action || 'unknown';

  // Log the attempt
  log.debug('Logging metrics data %j', send);

  // Start the reporting chain
  return Promise.resolve(this.endpoints)

  // Filter out any inactive endpoints
  .filter(function(endpoint) {
    return endpoint.report;
  })

  // Get the client and report
  .each(function(endpoint) {

    // Get the ID
    return getId(idFile)

    // Get client
    .then(function(id) {
      return new Client({id: id, url: endpoint.url});
    })

    // Report
    .then(function(reporter) {

      // Report
      reporter.report(send)

      // Handle errors, like unable to reach given url or no internet connection
      .catch(function(err) {
        log.debug(err);
      });

    });

  })

  // Make sure an unresponsive service doesn't hang the application.
  .timeout(10 * 500)

  // Wrap errors.
  .catch(function(err) {
    log.warn('Metrics: ' + err.message);
  });

};

/*
 * Return the class
 */
module.exports = Metrics;
