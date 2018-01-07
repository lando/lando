/**
 * Contains ways to interact with docker networks.
 *
 * @since 3.0.0
 * @module networks
 * @example
 *
 * // Get the networks
 * return lando.networks.get()
 *
 * // Print the networks
 * .then(function(networks) {
 *   console.log(networks);
 * });
 */

'use strict';

// Modules
var daemon = require('./daemon');
var Dockerode = require('dockerode');
var Promise = require('./promise');

var dockerInstance = new Dockerode(daemon.getEngineConfig());

/**
 * Gets the docker networks.
 *
 * @since 3.0.0
 * @see [docker api network docs](https://docs.docker.com/engine/api/v1.27/#operation/NetworkList) for info on filters option.
 * @param {Object} [opts] - Options to pass into the docker networks call
 * @param {Object} [opts.filters] - Filters options
 * @returns {Promise} A Promise with an array of network objects.
 * @example
 *
 *  // Options to filter the networks
 *  var opts = {
 *    filters: {
 *      driver: {bridge: true},
 *      name: {_default: true}
 *    }
 *  };
 *
 *  // Get the networks
 *  return lando.networks.get(opts)
 *
 *  // Filter out lando_default
 *  .filter(function(network) {
 *    return network.Name !== 'lando_default';
 *  })
 *
 *  // Map to list of network names
 *  .map(function(network) {
 *    return network.Name;
 *  });
 */
exports.get = function(opts) {

  // Get options
  var options = opts || {};

  // Get list of networks
  return Promise.fromNode(function(cb) {
    dockerInstance.listNetworks(options, cb);
  })

  // Wrap errors.
  .catch(function(err) {
    throw new Error(err, 'Error querying docker for list of networks.');
  });

};

/**
 * Prunes the docker networks.
 *
 * @since 3.0.0
 * @see [docker api network docs](https://docs.docker.com/engine/api/v1.27/#operation/NetworkPrune) for info on filters option.
 * @param {Object} [opts] - Options to pass into the docker networks call
 * @param {Object} [opts.filters] - Filters options
 * @returns {Promise} A Promise with teh status
 * @example
 *
 *  // Prune the networks
 *  return lando.networks.prune()
 *
 */
exports.prune = function(opts) {

  // Get options
  var options = opts || {};

  // Prune the networks
  return Promise.fromNode(function(cb) {
    dockerInstance.pruneNetworks(options, cb);
  })

  // Wrap errors.
  .catch(function(err) {
    throw new Error(err, 'Error pruning the networkz.');
  });

};
