'use strict';

// Modules
const _ = require('lodash');
const utils = require('./lib/utils');

module.exports = (app, lando) => {
  // Add localhost info to our containers if they are up
  _.forEach(['post-init', 'post-start'], event => {
    app.events.on(event, () => app.engine.list(app.name)
    // Return running containers
    .filter(container => app.engine.isRunning(container.id))
    // Make sure they are still a defined service (eg if the user changes their lando yml)
    .filter(container => _.includes(app.services, container.service))
    // Inspect each and add new URLS
    .map(container => app.engine.scan(container))
    // @TODO: figure out a good place to store "overrides" for services that should scan for more than
    // 80/443 so we dont have to hardcode 8983 for SOLR
    .map(data => utils.getUrls(data, ['80', '443', '8983']))
    .map(data => _.find(app.info, {service: data.service}).urls = data.urls));
  });

  // Refresh all our certs
  app.events.on('post-init', () => {
    const buildServices = _.get(app, 'opts.services', app.services);
    app.events.on('post-start', 9999, () => lando.engine.run(_.map(buildServices, service => ({
      id: `${app.project}_${service}_1`,
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

  // Collect info so we can inject LANDO_INFO
  //
  // @TODO: this is not currently the full lando info because a lot of it requires
  // the app to be on
  app.events.on('post-init', 10, () => {
    app.env.LANDO_INFO = JSON.stringify(app.info);
  });

  // Reset app info on a stop, this helps prevent wrong/duplicate information being reported on a restart
  app.events.on('post-stop', () => lando.utils.getInfoDefaults(app));

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

  // Scan urls
  app.events.on('post-start', 10, () => lando.scanUrls(_.flatMap(app.info, 'urls'), {max: 16})
    .then(urls => app.urls = urls));

  // REturn defualts
  return {
    env: {
      LANDO_APP_NAME: app.name,
      LANDO_APP_ROOT: app.root,
      LANDO_APP_ROOT_BIND: app.root,
      LANDO_LOAD_PP_KEYS: lando.config.loadPassphraseProtectedKeys.toString(),
    },
    labels: {
      'io.lando.src': app.configFiles.join(','),
    },
  };
};
