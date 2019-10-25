'use strict';

// Modules
const bugsnag = require('bugsnag');
const Promise = require('bluebird');

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
        // Register bug snag api from config.
        bugsnag.register(apiKey, {
          appVersion: data.version.replace(/-dev$/, ''),
          releaseStage: data.devMode ? 'development' : 'production',
        });
        // Create a new error with err message.
        const err = new Error(data.message);
        // Add stack trace.
        err.stack = data.stack;
        // Report to bug snag along with full meta data.
        return Promise.fromNode(cb => {
          bugsnag.notify(err, data, cb);
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
