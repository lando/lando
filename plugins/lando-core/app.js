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

// Update built against
const updateBuiltAgainst = (app, version = 'unknown') => {
  app.meta = _.merge({}, app.meta, {builtAgainst: version});
  return app.meta;
};

module.exports = (app, lando) => {
  // Add localhost info to our containers if they are up
  _.forEach(['post-init', 'post-start'], event => {
    app.events.on(event, () => {
      return app.engine.list({project: app.project})
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
  app.events.on('post-start', 1, () => lando.engine.list({project: app.project})
    // Filter out containers without a healthcheck
    .filter(container => _.has(_.find(app.info, {service: container.service}), 'healthcheck'))
    // Map to info
    .map(container => _.find(app.info, {service: container.service}))
    // Map to a retry of the healthcheck command
    .map(info => lando.Promise.retry(() => {
      return lando.engine.run({
        id: `${app.project}_${info.service}_1`,
        cmd: info.healthcheck,
        compose: app.compose,
        project: app.project,
        opts: {
          user: 'root',
          cstdio: 'pipe',
          silent: true,
          noTTY: true,
          services: [info.service],
        },
      })
      .catch(err => {
        console.log('Waiting until %s service is ready...', info.service);
        lando.log.verbose('Running healthcheck %s for %s until %s...', info.healthcheck, info.service);
        lando.log.debug(err);
        return Promise.reject(info.service);
      });
    }, {max: 25})
    .catch(service => {
      lando.log.info('Service %s is unhealthy', service);
      info.healthy = false;
      app.warnings.push({
        title: `The service "${service}" failed its healthcheck`,
        detail: ['This may be ok but we recommend you run the command below to investigate:'],
        command: `lando logs -s ${service}`,
      });
    })));

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

  // If the app already is installed but we can't determine the builtAgainst, then set it to something bogus
  app.events.on('pre-start', () => {
    if (!_.has(app.meta, 'builtAgainst')) {
      return lando.engine.list({project: app.project, all: true}).then(containers => {
        if (!_.isEmpty(containers)) {
          lando.cache.set(app.metaCache, updateBuiltAgainst(app), {persist: true});
        }
      });
    }
  });
  // If we don't have a builtAgainst already then we must be spinning up for the first time and its safe to set this
  app.events.on('post-start', () => {
    if (!_.has(app.meta, 'builtAgainst')) {
      lando.cache.set(app.metaCache, updateBuiltAgainst(app, app._config.version), {persist: true});
    }
    if (app.meta.builtAgainst !== app._config.version) {
      app.warnings.push({
        title: 'This app was built on a different version of Lando.',
        detail: [
          'While it may not be necessary, we highly recommend you update the app.',
          'This ensures your app is up to date with your current Lando version.',
          'You can do this with the command below:',
        ],
        command: 'lando rebuild',
      });
    }
  });
  // Otherwise set on rebuilds
  app.events.on('post-rebuild', () => {
    lando.cache.set(app.metaCache, updateBuiltAgainst(app, app._config.version), {persist: true});
  });

  // Remove meta cache on uninstall
  app.events.on('post-uninstall', () => {
    lando.cache.remove(app.metaCache);
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
