'use strict';

// Modules
const _ = require('lodash');
const {getLandoServices} = require('./../../lib/services');
const {getLandoProxyRoutes} = require('./../../lib/proxy');
const {getAppTooling} = require('./../../lib/tooling');
const {findClosestApplication} = require('./../../lib/config');

/*
 * Build Platformsh
 */
module.exports = {
  name: 'platformsh',
  parent: '_recipe',
  config: {
    confSrc: __dirname,
    proxy: {},
    services: {},
    tooling: {},
  },
  builder: (parent, config) => class LandoPlatformsh extends parent {
    constructor(id, options = {}) {
      // Get our options
      options = _.merge({}, config, options);
      // Get the platformConfig weve loaded and parsed
      const platformConfig = _.get(options, '_app.platformsh', {});
      // Combine application and service containers
      const services = _.flatten([platformConfig.applications, platformConfig.services]);

      // Map into lando services
      options.services = getLandoServices(services, platformConfig.runConfig);
      // Map into lando proxy routes
      options.proxy = getLandoProxyRoutes(platformConfig.routes, _.map(services, 'name'));

      // Map into lando tooling commands for the "closest" app
      const closestAppConfigFile = findClosestApplication();
      const closestApp = _.find(options.services, service => {
        return service.platformsh.configFile === closestAppConfigFile;
      });
      const applicationTooling = getAppTooling(closestApp);

      // @TODO: Also
      // const serviceTooling =

      // Merge and set the lando tooling
      options.tooling = _.merge({}, applicationTooling);

      // Send downstream
      super(id, options);
    };
  },
};
