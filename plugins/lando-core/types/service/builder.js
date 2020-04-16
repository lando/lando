'use strict';

// Modules
const _ = require('lodash');

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_service',
  parent: '_lando',
  builder: parent => class LandoService extends parent {
    constructor(id, options = {}, ...sources) {
      sources.push({services: _.set({}, options.name, {
        environment: {
          LANDO_WEBROOT: `/app/${options.webroot}`,
          LANDO_SERVICE_TYPE: 'service',
        },
      })});
      // @TODO: add in any envvars for this?
      // Add in relevant portforward data
      if (options.portforward) {
        if (options.portforward === true) {
          sources.push({services: _.set({}, options.name, {ports: [options.port]})});
        } else {
          sources.push({services: _.set({}, options.name, {ports: [`${options.portforward}:${options.port}`]})});
        }
      }
      // Add in relevant info
      options.info = _.merge({}, options.info, {
        internal_connection: {
          host: options.name,
          port: options.port,
        },
        external_connection: {
          host: options._app._config.bindAddress,
          port: _.get(options, 'portforward', 'not forwarded'),
        },
      });
      // Add in a our healthcheck if we have one
      if (options.healthcheck) options.info.healthcheck = options.healthcheck;
      // Add in creds if we have them
      if (options.creds) options.info.creds = options.creds;
      super(id, options, ...sources);
    };
  },
};
