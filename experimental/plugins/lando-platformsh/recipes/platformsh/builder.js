'use strict';

// Modules
const _ = require('lodash');
const {getLandoServices} = require('./../../lib/services');
const {getLandoProxyRoutes} = require('./../../lib/proxy');
const {findClosestApplication} = require('./../../lib/config');
const tooling = require('./../../lib/tooling');

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

      // Get the closest application
      const closestAppConfigFile = findClosestApplication();
      const closestApp = _.find(options.services, service => {
        return service.platformsh.configFile === closestAppConfigFile;
      });

      // Get the app tooling
      const applicationTooling = tooling.getAppTooling(closestApp);
      // Get relatable services
      const openData = options._app._lando.cache.get(`${options._app.name}.${closestApp.name}.open.cache`);
      const relatableServices = tooling.getRelatableServices(openData);
      const serviceContainers = _(options.services)
        .filter(service => _.includes(relatableServices, service.name))
        .map(service => service)
        .value();
      const serviceTooling = tooling.getServiceTooling(serviceContainers, openData);

      // Merge and set the lando tooling
      options.tooling = _.merge({}, applicationTooling, serviceTooling);

      // Send downstream
      super(id, options);
    };
  },
};
