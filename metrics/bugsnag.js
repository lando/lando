'use strict';

var bugsnag = require('bugsnag');
var Promise = require('bluebird');
var VError = require('verror');

module.exports = function(opts) {

  // Report error data.
  function report(data) {

    // Run inside of a promise context.
    return Promise.try(function() {
      // Only report errors.
      if (data.action === 'error') {

        // Get app version and remove trailing '-dev'.
        var appVersion = data.version.replace(/-dev$/, '');

        // Get release stage based on devMode.
        var releaseStage = data.devMode ? 'development' : 'production';

        // Register bug snag api from config.
        bugsnag.register(opts.apiKey, {
          appVersion: appVersion,
          releaseStage: releaseStage
        });

        // Create a new error with err message.
        var err = new Error(data.message);
        // Add stack trace.
        err.stack = data.stack;
        // Report to bug snag along with full meta data.
        return Promise.fromNode(function(cb) {
          bugsnag.notify(err, data, cb);
        });
      }
    })
    .catch(function(err) {
      throw new VError(err, 'Error notifying bugsnag.');
    });
  }

  // Export api.
  return {
    report: report
  };
};
