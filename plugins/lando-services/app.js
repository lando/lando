'use strict';

// Modules
const _ = require('lodash');
const utils = require('./lib/utils');

/*
 * @TODO
 */
module.exports = (app, lando) => {
  // @TODO: need to move this to a post init event so we can get recipes first
  const services = utils.parseConfig(_.get(app, 'config.services', {}), app);

  // @TODO sexier _() implementation?
  _.forEach(services, service => {
    // Throw a warning if service is not supported
    if (_.isEmpty(_.find(lando.factory.get(), {name: service.type}))) {
      lando.log.warn('%s is not a supported service type.', service.type);
    }
    // Log da things
    lando.log.verbose('Building %s %s named %s', service.type, service.version, service.name);
    lando.log.debug('Building %s with config %j', service.name, service);
    // Build da things
    const Service = lando.factory.get(service.type);
    app.add(new Service(service.name, service, lando.factory));
  });

  // Add in our app info
  app.events.on('post-info', () => {
    _.forEach(services, service => {
      const Service = lando.factory.get(service.type);
      const build = new Service(service.name, service);
      build.info(service, _.find(app.info, {service: service.name}));
    });
  });
};
