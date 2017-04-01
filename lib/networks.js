/**
 * Module to wrap and abstract access to dockerode's network stuff.
 *
 * @name network
 */

'use strict';

// Modules
var daemon = require('./daemon');
var Dockerode = require('dockerode');
var Promise = require('./promise');

var dockerInstance = new Dockerode(daemon.getEngineConfig());

/**
 * Query docker for a list of network.
 */
exports.get = function(opts) {

  // Get options
  var options = opts || {};

  // Query docker for list of containers.
  return Promise.fromNode(function(cb) {
    dockerInstance.listNetworks(options, cb);
  })

  // Wrap errors.
  .catch(function(err) {
    throw new Error(err, 'Error querying docker for list of networks.');
  });

};
