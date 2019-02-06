'use strict';

// Modules
const _ = require('lodash');
const toObject = require('./../../lib/utils').toObject;
const utils = require('./lib/utils');

// Helper to get http ports
const getHttpPorts = data => _.get(data, 'Config.Labels["io.lando.http-ports"]', '80,443').split(',');

// Helper to get scannable or not scannable services
const getScannable = (app, scan = true) => _.filter(app.info, service => {
  return _.get(app, `config.services.${service.service}.scanner`, true) === scan;
});

module.exports = (app, lando) => {
  // Add localhost info to our containers if they are up
  _.forEach(['post-init', 'post-start'], event => {
    app.events.on(event, () => {
      return app.engine.list({app: app.name})
      // Return running containers
      .filter(container => app.engine.isRunning(container.id))
      // Make sure they are still a defined service (eg if the user changes their lando yml)
      .filter(container => _.includes(app.services, container.service))
      // Inspect each and add new URLS
      .map(container => app.engine.scan(container))
      // Scan all the http ports
      .map(data => utils.getUrls(data, getHttpPorts(data)))
      .map(data => _.find(app.info, {service: data.service}).urls = data.urls);
    });
  });

  // Refresh all our certs
  app.events.on('post-init', () => {
    const buildServices = _.get(app, 'opts.services', app.services);
    app.events.on('post-start', 9999, () => lando.Promise.each(buildServices, service => {
      return lando.engine.run({
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
      })
      .catch(err => {
        lando.log.error('Looks like %s is not running! It should be so this is a problem.', service);
        lando.log.warn('Try running `lando logs -s %s` to help locate the problem!', service);
        lando.log.debug(err.stack);
      });
    }));
  });

  // Collect info so we can inject LANDO_INFO
  //
  // @TODO: this is not currently the full lando info because a lot of it requires
  // the app to be on
  app.events.on('post-init', 10, () => {
    const info = toObject(_.map(app.info, 'service'), {});
    _.forEach(info, (value, key) => {
      info[key] = _.find(app.info, {service: key});
    });
    app.env.LANDO_INFO = JSON.stringify(info);
  });

  // Reset app info on a stop, this helps prevent wrong/duplicate information being reported on a restart
  app.events.on('post-stop', () => lando.utils.getInfoDefaults(app));

  // Add some logic that extends start until healthchecked containers report as healthy
  app.events.on('post-start', 1, () => lando.engine.list({app: app.name})
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
  app.events.on('post-start', 10, () => {
    // Filter out any services where the scanner might be disabled
    return lando.scanUrls(_.flatMap(getScannable(app), 'urls'), {max: 16}).then(urls => {
      // Get data about our scanned urls
      app.urls = urls;
      // Add in unscannable ones if we have them
      if (!_.isEmpty(getScannable(app, false))) {
        app.urls = app.urls.concat(_.map(_.flatMap(getScannable(app, false), 'urls'), url => ({
          url,
          status: true,
          color: 'yellow',
        })));
      }
    });
  });

  // REturn defualts
  return {
    env: {
      LANDO_APP_PROJECT: app.project,
      LANDO_APP_NAME: app.name,
      LANDO_APP_ROOT: app.root,
      LANDO_APP_ROOT_BIND: app.root,
      // @todo: do we want to set the below based on the lando verbose level?
      BITNAMI_DEBUG: 'true',
    },
    labels: {
      'io.lando.src': app.configFiles.join(','),
      'io.lando.http-ports': '80,443',
    },
  };
};
