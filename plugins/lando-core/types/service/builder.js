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
      // Add in a our healthcheck if we have one
      if (options.healthcheck) {
        sources.push({services: _.set({}, options.name, {healthcheck: {
          test: options.healthcheck,
          interval: '2s',
          timeout: '10s',
          retries: 25,
        }})});
      }
      // Add in relevant info
      options.info = _.merge({}, options.info, {
        internal_connection: {
          host: options.name,
          port: options.port,
        },
        external_connection: {
          host: 'localhost',
          port: _.get(options, 'portforward', 'not forwarded'),
        },
      });
      // Add in creds if we have them
      if (options.creds) options.info.creds = options.creds;
      super(id, options, ...sources);
    };
  },
};
