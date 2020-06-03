'use strict';

// Modules
const _ = require('lodash');
const {getLandoAuxServices, getLandoServices} = require('./../../lib/services');
const {getLandoTooling} = require('./../../lib/tooling');
const {getLandoProxyRoutes} = require('./../../lib/proxy');


/*
 * Build Lagoon
 */
module.exports = {
  name: 'lagoon',
  parent: '_recipe',
  config: {
    confSrc: __dirname,
    flavor: 'lagoon',
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
      options.services = getLandoAuxServices(options.services);

      // Map into lando tooling commands
      options.tooling = getLandoTooling(options.services);

      // Map into lando proxy routes
      options.proxy = getLandoProxyRoutes(options.services, _.get(options, '_app.lagoon.domain'));

      // Send downstream
      super(id, options);
    };
  },
};
