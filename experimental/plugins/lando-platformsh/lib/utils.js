'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

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

/*
 * Helper to get terminus tokens
 */
exports.getPlatformshTokens = home => {
  if (fs.existsSync(path.join(home, '.platformsh', 'cache', 'tokens'))) {
    return _(fs.readdirSync(path.join(home, '.platformsh', 'cache', 'tokens')))
      .map(tokenFile => path.join(home, '.platformsh', 'cache', 'tokens', tokenFile))
      .map(file => JSON.parse(fs.readFileSync(file, 'utf8')))
      .value();
  } else {
    return [];
  }
};

/*
 * Helper to return most recent tokens
 */
exports.sortTokens = (...sources) => _(_.flatten([...sources]))
  .sortBy('date')
  .groupBy('email')
  .map(tokens => _.last(tokens))
  .value();
