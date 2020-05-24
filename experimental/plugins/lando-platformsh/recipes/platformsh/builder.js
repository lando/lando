'use strict';

// Modules
const _ = require('lodash');
const {getLandoServices} = require('./../../lib/services');
const {getLandoProxyRoutes} = require('./../../lib/proxy');
// const {getLandoTooling} = require('./../../lib/tooling');


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
      // Map into lando tooling
      // @TODO: map dependencies? eg grunt-cli, drush, etc?
      // @TODO: should we surface all commands available by default? eg python, node, npm?
      // options.tooling = getLandoTooling(options.services);
      // console.log(options.tooling);
      // process.exit(1);
      // Add php tooling

      // @TODO: wrap all tooling/buildsteps woth /helpers/exeute
      // @TODO: in a multistep scenario lets set the service to be whatever is in the first .platform.yaml we find
      // when we traverse back
      options.tooling = {
        drush: {
          cmd: '/helpers/psh-exec.sh drush',
          service: 'app',
        },
      };

      // Send downstream
      super(id, options);
    };
  },
};
