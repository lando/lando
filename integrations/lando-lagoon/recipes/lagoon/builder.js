'use strict';

// Modules
const _ = require('lodash');
const {getLandoAuxServices, getLandoServices, getSQLServices} = require('./../../lib/services');
const {getLandoTooling, getDBUtils} = require('./../../lib/tooling');
const {getLandoProxyRoutes} = require('./../../lib/proxy');


/*
 * Build Lagoon
 */
module.exports = {
  name: 'lagoon',
  parent: '_recipe',
  config: {
    confSrc: __dirname,
    build: [],
    proxy: {},
    services: {},
    tooling: {},
  },
  builder: (parent, config) => class LandoLagoon extends parent {
    constructor(id, options = {}) {
      // Get our options
      options = _.merge({}, config, options);
      // Get the lagoon config weve loaded and parsed
      const lagoonConfig = _.get(options, '_app.lagoon', {});

      // Map into lando services
      options.services = getLandoServices(lagoonConfig.services);
      // Add in any additional dev services eg mailhog we need
      options.services = getLandoAuxServices(options.services, options._app._config);

      // Map into lando tooling commands
      options.tooling = getLandoTooling(options.services);
      // If we have a SQL service then add in the db import/export commands
      const sqlServices = getSQLServices(options.services);
      if (!_.isEmpty(sqlServices)) {
        const firstDbService = _.first(sqlServices);
        options.tooling = _.merge({}, options.tooling, getDBUtils(firstDbService.name));
      }
      // If we have the lagoong cli then add that in as well
      if (_.has(options, 'services.lagooncli')) {
        options.tooling.lagoon = {service: 'lagooncli', cmd: '/lagoon', user: 'root'};
      }

      // Map into lando proxy routes
      options.proxy = getLandoProxyRoutes(options.services, _.get(options, '_app.lagoon.domain'));

      // Send downstream
      super(id, options);
    };
  },
};
