'use strict';

const bugsnag = require('bugsnag');
const Promise = require('bluebird');

/**
 * Bugsnag plugin and things
 * @param {Object} opts options
 * @return {Object} stuff
 */
module.exports = opts => ({
  report: (data = {}) => {
    // Run inside of a promise context.
    return Promise.try(function() {
      // Only report errors.
      if (data.action === 'error') {
        // Get app version and remove trailing '-dev'.
        const appVersion = data.version.replace(/-dev$/, '');
        // Get release stage based on devMode.
        const releaseStage = data.devMode ? 'development' : 'production';
        // Register bug snag api from config.
        bugsnag.register(opts.apiKey, {
          appVersion: appVersion,
          releaseStage: releaseStage,
        });
        // Create a new error with err message.
        const err = new Error(data.message);
        // Add stack trace.
        err.stack = data.stack;
        // Report to bug snag along with full meta data.
        return Promise.fromNode(function(cb) {
          bugsnag.notify(err, data, cb);
        });
      }
    })
    .catch(function(err) {
      throw new Error(err, 'Error notifying bugsnag.');
    });
  },
});
