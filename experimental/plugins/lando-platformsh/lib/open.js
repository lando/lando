'use strict';

// Modules
const _ = require('lodash');

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
