'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to build mysq connect string
 */
const buildMysqlConnectString = ({username, service, password = null} = {}) => {
  if (password) return `mysql -u${username} -h${service} -p${password}`;
  else return `mysql -u${username} -h${service}`;
};

/*
 * Helper to get php related tooling commands
 */
const getMySqlTooling = services => _(services)
  .map(service => ({
    name: service.relationship,
    description: `Connects to the ${service.relationship} relationship`,
    cmd: buildMysqlConnectString(service),
    service: service.service,
    level: 'app',
  }))
  .value();

/*
 * Helper to get php related tooling commands
 */
const getPhpTooling = (service = 'app') => ({composer: {service}, php: {service}});

/*
 * Helper to map lagoon type data to a lando service
 */
const getAppToolingByType = app => {
  switch (app.platformsh.type) {
    case 'php': return getPhpTooling(app.name);
    default: return {};
  };
};

/*
 * Helper to map lagoon type data to a lando service
 */
const getServiceToolingByType = ({type, services} = {}) => {
  switch (type) {
    case 'mariadb': return getMySqlTooling(services);
    case 'mysql': return getMySqlTooling(services);
    default: return {};
  };
};

/*
 * Maps parsed platform config into related Lando things
 */
exports.getAppTooling = app => _.merge({}, {platform: {service: app.name}}, getAppToolingByType(app));

/*
 * Helper to get relatable services eg services for which the closest app has a relationship
 */
exports.getRelatableServices = (relationships = {}) => _(relationships)
  .map(relationship => relationship)
  .flatten()
  .map('service')
  .uniqBy()
  .value();

/*
 * Maps parsed platform config into related Lando things
 */
exports.getServiceTooling = (services, relationships) => {
  // Group the relationships by the service
  const parsedRelationships = _(relationships)
    .map((relationship, name) => _.merge({}, relationship[0], {relationship: name}))
    .groupBy('service')
    .value();
  // Groups the services by the service type
  const parsedServices = _(services)
    .groupBy('platformsh.type')
    .map((service, type) => _.merge({}, {type}, {
      services: _.flatten(_.map(service, s => parsedRelationships[s.name])),
    }))
    .value();

  // Build the tooling array
  return _(parsedServices)
    .map(service => getServiceToolingByType(service))
    .flatten()
    .map(service => ([service.name, _.omit(service, 'name')]))
    .fromPairs()
    .value();
};
