'use strict';

// Modules
const _ = require('lodash');
const {getLandoAuxServices, getLandoServices} = require('./../../lib/services');
const {getLandoTooling} = require('./../../lib/tooling');

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

      // Map into proxy routes
      // Add nginx stuff as needed
      if (_.includes(_.keys(options.services), 'nginx')) {
        options.proxy.nginx = [`${options.app}.${options._app._config.domain}:8080`];
      }
      // Add the php stuff like mailhog service
      if (_.includes(_.keys(options.services), 'php')) {
        options.proxy.mailhog = [`inbox-${options.app}.${options._app._config.domain}`];
      }

      // Send downstream
      super(id, options);
    };
  },
};
