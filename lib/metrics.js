'use strict';

const _ = require('lodash');
const Client = require('kalabox-stats-client').Client;
const fs = require('fs-extra');
const Log = require('./logger');
const os = require('os');
const path = require('path');
const Promise = require('./promise');
const random = require('uuid/v4');

/*
 * Get the metrics ID for this lando instance.
 */
const getId = idFile => Promise.fromNode(cb => {
    fs.readFile(idFile, {encoding: 'utf8'}, cb);
  })

  // File does not exist.
  .catch(err => {
    if (err.code === 'ENOENT') return null;
    throw err;
  })

  // If ID file doesn't exist, get new ID from REST API and write ID file.
  .then(id => {
    if (id) {
      return id;
    } else {
      id = random();
      // Write new ID to ID file.
      return Promise.fromNode(cb => {
        fs.writeFile(idFile, id, cb);
      })
      // Return id.
      .return(id);
    }
  });

/*
 * Creates a new Metrics thing.
 */
module.exports = class Metrics {
  constructor({log = new Log(), idFilename = '.instance.id', idDir = os.tmpdir(), endpoints = [], data = {}} = {}) {
    this.log = log;
    this.idFilename = idFilename;
    this.idDir = idDir;
    this.endpoints = endpoints;
    this.idFile = path.join(this.idDir, this.idFilename);
    this.data = data;
  };

  report(action = 'unknown', data) {
    // Get Stuff
    const log = this.log;
    const idFile = this.idFile;
    const send = _.merge(this.data, data, {action});
    // Log the attempt
    log.debug('Logging metrics data %j', send);
    // Start the reporting chain
    return Promise.resolve(this.endpoints)
    // Filter out any inactive endpoints
    .filter(endpoint => endpoint.report)
    // Get the client and report
    .each(endpoint => getId(idFile)
    // Get client
    // @todo: remove client in favor of non-external option
    .then(id => new Client({id: id, url: endpoint.url}))
    // Report
    .then(reporter => reporter.report(send))
    // Handle errors, like unable to reach given url or no internet connection
    .catch(err => {
      log.debug(err);
    }))
    // Make sure an unresponsive service doesn't hang the application.
    .timeout(10 * 500)
    // Wrap errors.
    .catch(err => {
      log.warn('Metrics: ' + err.message);
    });
  };
};
