'use strict';

const _ = require('lodash');
const axios = require('axios');
const cleanStack = require('clean-stacktrace');
const Log = require('./logger');
const path = require('path');
const Promise = require('./promise');

/*
 * Helper to cleanse path
 */
const cleanLine = (line = '') => {
  const m = /.*\((.*)\).?/.exec(line) || [];
  return m[1] ? line.replace(m[1], _.last(m[1].split(path.sep))) : line;
};

/*
 * Helper to sanitize data
 */
const cleanseData = data => {
  if (!_.isEmpty(data.stack)) data.stack = cleanStack(data.stack, cleanLine);
  if (!_.isEmpty(data.message)) data.message = cleanLine(data.message);
  return data;
};

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
    // Attempt to sanitize merged data as much as possible
    const send = cleanseData(_.merge({}, this.data, data, {action, created: new Date().toJSON()}));
    // Log the attempt
    log.verbose('reporting %s action to', action, this.endpoints);
    log.debug('reported data', send);
    // Start the reporting chain
    return Promise.resolve(this.endpoints)
    // Filter out any inactive endpoints
    .filter(endpoint => endpoint.report)
    // Get the client and report
    .map(endpoint => {
      const agent = axios.create({baseURL: endpoint.url});
      // Post the data
      return agent.post('/metrics/v2/' + id, send).catch(error => {
        const url = _.get(endpoint, 'url', 'unknown');
        const status = _.get(error, 'response.status', 'unknown');
        const reason = _.get(error, 'response.statusText', 'unknown');
        const message = _.get(error, 'response.data.message', 'unknown');
        log.debug('metrics post to %s failed with %s (%s) %s', url, status, reason, message);
      });
    });
  };
};
