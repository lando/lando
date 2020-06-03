'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to find containers that serve
 */
const getServingContainers = services => _(services)
  .filter(service => service.type === 'lagoon-nginx')
  .map('name')
  .value();

/*
 * Helper to map parsed platform config into related Lando things
 */
exports.getLandoProxyRoutes = (services, domain, proxy = {}) => {
  // Find the primary serving container
  const server = _.first(getServingContainers(services));
  // Add the primary domain to this if it exists
  // @NOTE: can we assume nginx is always served from 8080?
  if (server) proxy[server] = [`${domain}:8080`];

  // Add mailhog if its there
  if (_.includes(_.keys(services), 'mailhog')) {
    proxy.mailhog = [`inbox.${domain}`];
  }

  // Return
  return proxy;
};
