'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/services');

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
      options.services = utils.getLandoServices(services, platformConfig.runConfig);

      // Map into lando proxy routes
      // options.proxy = {app: ['lando-d8.lndo.site']};

      // Map into lando tooling routes

      // Do a final pass so we wrap all build steps/tooling/etc in /helpers/execute.sh
      // @TODO: try out custom build step/tooling
      options.tooling = {
        node: {service: 'app'},
      };

      // Send downstream
      super(id, options);
    };
  },
};
