'use strict';

// Modules
const _ = require('lodash');

module.exports = (app, lando) => {
  // @TODO: im not sure how below is possible in new framework?
  // Collect info so we can inject LANDO_INFO
  //
  // @TODO: this is not currently the full lando info because a lot of it requires
  // the app to be on
  /*
  app.events.on('pre-init', () => {
    return app.inspect().then(() => {
      app.env.LANDO_INFO = JSON.stringify(app.info);
    });
  });
  */

  // Refresh all our certs
  app.events.on('post-init', () => {
    const buildServices = _.get(app, 'opts.services', app.services);
    app.events.on('post-start', 9999, () => lando.engine.run(_.map(buildServices, service => ({
      id: `${app.name}_${service}_1`,
      cmd: '/helpers/refresh-certs.sh > /cert-log.txt',
      compose: app.compose,
      project: app.project,
      opts: {
        detach: true,
        mode: 'attach',
        user: 'root',
        services: [service],
      },
    }))));
  });

  // Add some logic that extends start until healthchecked containers report as healthy
  app.events.on('post-start', 1, () => lando.engine.list(app.name)
    .map(container => lando.Promise.retry(() => {
      // Log that we are checking shit
      console.log('Waiting until %s service is ready...', container.service);
      lando.log.info('Waiting until %s service is ready...', container.service);

      // Inspect the containers for healthcheck status
      return lando.engine.scan({id: container.id}).then(data => {
        if (!_.has(data, 'State.Health')) return {service: container.service, health: 'healthy'};
        if (_.get(data, 'State.Health.Status', 'unhealthy') === 'healthy') {
          return {service: container.service, health: 'healthy'};
        } else {
          return lando.Promise.reject();
        }
      });
    }, {max: 25})
    // Set metadata if weve got a naught service
    .catch(error => ({service: container.service, health: 'unhealthy'})))
    // Analyze and warn if needed
    .map(status => {
      if (status.health === 'unhealthy') {
        lando.log.warn('Service %s is unhealthy', status.service);
        lando.log.warn('Run "lando logs -s %s"', status.service);
      }
      lando.log.verbose('Healthcheck for %s = %j', app.name, status);
    }));

  // REturn defualts
  return {
    env: {
      LANDO_APP_NAME: app.name,
      LANDO_APP_ROOT: app.root,
      LANDO_APP_ROOT_BIND: app.root,
      LANDO_LOAD_PP_KEYS: lando.config.loadPassphraseProtectedKeys.toString(),
    },
    labels: {
      'io.lando.src': app.configFile,
    },
  };
};
