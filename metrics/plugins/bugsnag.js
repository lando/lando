'use strict';

// Modules
const bugsnag = require('@bugsnag/js');
const Promise = require('bluebird');

/*
 * Return registered data
 */
const getRegistrationData = (apiKey, data = {}) => ({
  apiKey,
  appType: `${data.context}-${data.mode}`,
  appVersion: data.version.replace(/-dev$/, ''),
  releaseStage: data.product || 'kalabox',
});

/*
 * Return user data
 */
const getUserData = (data = {}) => ({
  id: data.instance,
  name: data.name || data.instance,
  email: data.email || 'unknown',
});

/*
 * Return context data
 */
const getContextData = (data = {}) => {
  switch (data.product) {
    case 'lando': return data.command;
    case 'localdev': return data.operation || data.command;
    default: return 'kalabox';
  }
};

/*
 * Creates a new BS instance.
 */
class Bugsnag {
  constructor({apiKey}) {
    this.apiKey = apiKey;
  };

  /*
   * Ping connection.
   */
  ping() {
    return Promise.resolve(true);
  };

  /*
   * Insert document into cluster.
   */
  report(data) {
    const apiKey = this.apiKey;
    return Promise.try(() => {
      // Only report errors.
      if (data.action === 'error') {
        // Register client and set data for bugsnag.
        const client = bugsnag(getRegistrationData(apiKey, data));
        client.user = getUserData(data);
        client.context = getContextData(data);
        client.metaData = data;
        // Create a new error with err message.
        const err = new Error(data.message);
        // Add stack trace.
        err.stack = data.stack;
        // Report to bug snag along with full meta data.
        return new Promise((resolve, reject) => {
          client.notify(err, {}, (err, report) => {
            if (err) reject(err);
            else resolve(report);
          });
        });
      }
    });
  };

  /*
   * Close connection.
   */
  close() {
  };
};

/*
 * Return the class
 */
module.exports = Bugsnag;
