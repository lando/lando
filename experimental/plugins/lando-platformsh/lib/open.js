'use strict';

// Modules
const _ = require('lodash');

/*
 * Get service IP address by network
 */
exports.getIPAddress = (data, network = 'lando_bridge_network') => {
  return _.get(data, `NetworkSettings.Networks.${network}.IPAddress`, '127.0.0.1');
};

/*
 * Helper to filter out services from application containers
 */
exports.getNonApplicationServices = (services = []) => _(services)
  .filter(service => !service.platformsh.application)
  .value();

/*
 * Helper to get the application service hostname
 */
exports.getContainersByType = (app, appserver = true) => _(_.get(app, 'config.services', {}))
  .map((data, name) => ({name, appserver: data.appserver}))
  .filter(service => service.appserver === appserver)
  .map(service => service.name)
  .value();

/*
 * Helper to get the application service hostname
 */
exports.getApplicationRelationships = (app, name = 'app') => _(app.platformsh.runConfig)
  .filter(service => service.service === name)
  .map(service => service.data.applications)
  .flatten()
  .filter(application => application.configuration.name === name)
  .map(application => application.configuration.relationships)
  .thru(relationships => _.first(relationships))
  .value();

/*
 * Helper to get the application service hostname
 */
exports.generateOpenPayload = (appserverRelationships, serviceData) => _.fromPairs(_(appserverRelationships)
  .map((value, name) => {
    const service = value.split(':')[0];
    const endpoint = value.split(':')[1];
    return [
      name,
      [_.merge({}, _.get(serviceData, `${service}.${endpoint}`), {host: service, ip: null})],
    ];
  })
  .value());
