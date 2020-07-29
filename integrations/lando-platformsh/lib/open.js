'use strict';

// Modules
const _ = require('lodash');
const os = require('os');

/*
 * Get service IP address by network
 */
exports.getIPAddress = (data, network = 'lando_bridge_network') => {
  return _.get(data, `NetworkSettings.Networks.${network}.IPAddress`, '127.0.0.1');
};

/*
 * Helper to get the application service hostname
 */
exports.generateOpenPayload = (data, relationships) => _.fromPairs(_(relationships)
  .map(relationship => ([
    relationship.alias,
    [_.merge({}, _.get(data, relationship.path), {host: `${relationship.alias}.internal`})],
  ]))
  .value());

/*
 * Helper to parse open data
 * @TODO: We may need to improve this
 */
exports.parseOpenData = data => JSON.parse(_.last(data[0].split(os.EOL)));

/*
 * Helper to get the application service hostname
 */
exports.parseRelationships = (relationships = {}) => _(relationships)
  .map((relationship, alias) => ({alias, path: relationship.replace(':', '.')}))
  .value();
