'use strict';

// Modules
const _ = require('lodash');

/*
 * The lowest level class from which all other services and recipes are built on
 * @TODO: presumably this will get larger over time as we add more options
 */
module.exports = class ComposeService {
  constructor(
    services = {},
    volumes = {},
    networks = {},
    version = '3.2',
    {env = {}, labels = {}} = {}
  ) {
    // Mix in global env and labels
    _.forEach(services, (service, key) => {
      services[key] = _.merge({}, {environment: env, labels}, service);
    });
    // Return the result
    return {version, services, volumes, networks};
  };
};
