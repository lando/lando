'use strict';

const _ = require('lodash');
const axios = require('axios');
const Log = require('./logger');
const Promise = require('./promise');

/*
 * Creates a new Metrics thing.
 */
module.exports = class Metrics {
  constructor({id = 'unknown', log = new Log(), endpoints = [], data = {}} = {}) {
    this.id = id;
    this.log = log;
    this.endpoints = endpoints;
    this.data = data;
  };

  report(action = 'unknown', data = {}) {
    // Get Stuff
    const log = this.log;
    const id = this.id;
    const send = _.merge({}, this.data, data, {action, created: new Date().toJSON()});
    // Log the attempt
    log.debug('Logging metrics data %j', send);
    // Start the reporting chain
    return Promise.resolve(this.endpoints)
    // Filter out any inactive endpoints
    .filter(endpoint => endpoint.report)
    // Get the client and report
    .each(endpoint => {
      const agent = axios.create({baseURL: endpoint.url});
      // Post the data
      return agent.post('/metrics/v2/' + id, send)
      .catch(error => {
        const url = _.get(error, 'response.config.url', 'unknown');
        const status = _.get(error, 'response.status', 'unknown');
        const reason = _.get(error, 'response.statusText', 'unknown');
        log.debug('Metrics post to %s failed with %s (%s)', url, status, reason);
      });
    });
  };
};
