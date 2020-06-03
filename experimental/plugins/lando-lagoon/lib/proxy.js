'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to find containers that serve
 */
const getServingContainers = services => _(services)
  .filter(service => service.type === 'lagoon-nginx-drupal' || service.type === 'lagoon-nginx')
  .map('name')
  .value();

/*
 * Helper to map parsed platform config into related Lando things
 */
exports.getLandoProxyRoutes = (services, domain, proxy = {}) => {
  // Find the primary serving container
  const server = _.first(getServingContainers(services));
  // Add the primary domain to this if it exists
  if (server) proxy[server] = [domain];

  // Add mailhog if its there
  if (_.includes(_.keys(services), 'mailhog')) {
    proxy.mailhog = [`inbox.${domain}`];
  }

  // Return
  return proxy;
};
