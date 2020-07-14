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
 * Helper to find containers that serve
 */
const getOtherServingContainers = services => _(services)
  .filter(service => service.type === 'lagoon-varnish')
  .map('name')
  .value();

/*
 * Helper to map parsed platform config into related Lando things
 */
exports.getLandoProxyRoutes = (services, domain, proxy = {}) => {
  // Find the primary serving container
  const nginxServers = getServingContainers(services);
  const primaryServer = _.first(nginxServers);
  // Add the primary domain to this if it exists
  // @NOTE: can we assume nginx is always served from 8080?
  if (primaryServer) {
    proxy[primaryServer] = [`${domain}:8080`];
    nginxServers.shift();
  }

  // Collect the other serving containers
  const otherServingContainers = nginxServers.concat(getOtherServingContainers(services));
  // If we have other serving containers then lets also set up a proxies for those
  if (!_.isEmpty(otherServingContainers)) {
    _.forEach(otherServingContainers, service => {
      proxy[service] = [`${service}.${domain}:8080`];
    });
  }

  // Add mailhog if its there
  if (_.includes(_.keys(services), 'mailhog')) {
    proxy.mailhog = [`inbox.${domain}`];
  }

  // Return
  return proxy;
};
