/**
 * Helpers for app things.
 *
 * @since 3.0.0
 * @module utils
 */

'use strict';

// Modules
var _ = require('lodash');

/**
 * Checks if there is already an app with the same name in an app _registry
 * object
 *
 * @since 3.0.0
 */
exports.appNameExists = function(apps, app) {
  return _.some(apps, function(a) {
    return a.name === app.name;
  });
};
