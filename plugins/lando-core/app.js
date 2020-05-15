'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const toObject = require('./../../lib/utils').toObject;
const utils = require('./lib/utils');
const warnings = require('./lib/warnings');

// Helper to get http ports
const getHttpPorts = data => _.get(data, 'Config.Labels["io.lando.http-ports"]', '80,443').split(',');
const getHttpsPorts = data => _.get(data, 'Config.Labels["io.lando.https-ports"]', '443').split(',');

// Helper to get scannable or not scannable services
const getScannable = (app, scan = true) => _.filter(app.info, service => {
  return _.get(app, `config.services.${service.service}.scanner`, true) === scan;
});

// Helper to set the LANDO_LOAD_KEYS var
const getKeys = (keys = true) => {
  if (_.isArray(keys)) return keys.join(' ');
  return keys.toString();
};

// Helper to bind exposed ports to the correct address
const normalizeBind = (bind, address = '127.0.0.1') => {
  // If bind is not a string, return right away
  if (!_.isString(bind)) return bind;

  // Otherwise attempt to do stuff
  const pieces = _.toString(bind).split(':');
  // If we have three pieces then honor the users choice
  if (_.size(pieces) === 3) return bind;
  // Unshift the address to the front and return
  else if (_.size(pieces) === 2) {
    pieces.unshift(address);
    return pieces.join(':');
  };
  // Otherwise we can just return the address prefixed to the bind
  return `${address}::${bind}`;
};

// Update built against
const updateBuiltAgainst = (app, version = 'unknown') => {
  app.meta = _.merge({}, app.meta, {builtAgainst: version});
  return app.meta;
};

module.exports = (app, lando) => {
  // Add localhost info to our containers if they are up
  _.forEach(['post-init', 'post-start'], event => {
    app.events.on(event, () => {
      app.log.verbose('attempting to find open services...');
      return app.engine.list({project: app.project})
      // Return running containers
      .filter(container => app.engine.isRunning(container.id))
      // Make sure they are still a defined service (eg if the user changes their lando yml)
      .filter(container => _.includes(app.services, container.service))
      // Inspect each and add new URLS
      .map(container => app.engine.scan(container))
      // Scan all the http ports
      .map(data => utils.getUrls(data, getHttpPorts(data), getHttpsPorts(data), lando.config.bindAddress))
      .map(data => _.find(app.info, {service: data.service}).urls = data.urls);
    });
  });

  // Refresh all our certs
  app.events.on('post-init', () => {
    const buildServices = _.get(app, 'opts.services', app.services);
    app.log.verbose('refreshing certificates...', buildServices);
    app.events.on('post-start', 9999, () => lando.Promise.each(buildServices, service => {
      return app.engine.run({
        id: `${app.project}_${service}_1`,
        cmd: 'mkdir -p /certs && /helpers/refresh-certs.sh > /certs/refresh.log',
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
        app.addWarning(warnings.serviceNotRunningWarning(service), err);
      });
    }));
  });

  // Run a secondary user perm sweep on services that cannot run as root eg mysql
  app.events.on('post-init', () => {
    if (!_.isEmpty(app.nonRoot)) {
      app.log.verbose('perm sweeping flagged non-root containers ...', app.nonRoot);
      app.events.on('post-start', 1, () => lando.Promise.each(app.nonRoot, service => {
        return app.engine.run({
          id: `${app.project}_${service}_1`,
          cmd: '/helpers/user-perms.sh --silent',
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
          app.addWarning(warnings.serviceNotRunningWarning(service), err);
        });
      }));
    }
  });

  // Assess our key situation so we can warn users who may have too many
  app.events.on('post-init', () => {
    // Get keys on host
    const sshDir = path.resolve(lando.config.home, '.ssh');
    const keys = _(fs.readdirSync(sshDir))
      .filter(file => !_.includes(['config', 'known_hosts'], file))
      .filter(file => path.extname(file) !== '.pub')
      .value();

    // Determine the key size
    const keySize = _.size(_.get(app, 'config.keys', keys));
    app.log.verbose('analyzing user ssh keys... using %s of %s', keySize, _.size(keys));
    app.log.debug('key config... ', _.get(app, 'config.keys', 'none'));
    app.log.silly('users keys', keys);
    // Add a warning if we have more keys than the warning level
    if (keySize > lando.config.maxKeyWarning) {
      app.addWarning(warnings.maxKeyWarning());
    }
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
    app.log.verbose('setting LANDO_INFO...');
    app.env.LANDO_INFO = JSON.stringify(info);
  });

  // Analyze an apps compose files so we can set the default bind address
  // correctly
  //
  // @TODO: i feel like there has to be a better way to do this than this mega loop right?
  app.events.on('post-init', 9999, () => {
    _.forEach(app.composeData, service => {
      _.forEach(service.data, datum => {
        _.forEach(datum.services, props => {
          if (!_.isEmpty(props.ports)) {
            app.log.debug('ensuring exposed ports on %s are bound to %s', service.id, lando.config.bindAddress);
            props.ports = _(props.ports).map(port => normalizeBind(port, lando.config.bindAddress)).value();
          }
        });
      });
    });
  });

 // Add some logic that extends start until healthchecked containers report as healthy
  app.events.on('post-start', 1, () => lando.engine.list({project: app.project})
    // Filter out containers without a healthcheck
    .filter(container => _.has(_.find(app.info, {service: container.service}), 'healthcheck'))
    // Map to info
    .map(container => _.find(app.info, {service: container.service}))
    // Map to a retry of the healthcheck command
    .map(info => lando.Promise.retry(() => {
      return app.engine.run({
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
        app.log.debug('running healthcheck %s for %s...', info.healthcheck, info.service);
        // app.log.silly(err);
        return Promise.reject(info.service);
      });
    }, {max: 25, backoff: 1000})
    .catch(service => {
      info.healthy = false;
      app.addWarning(warnings.serviceUnhealthyWarning(service), Error(`${service} reported as unhealthy.`));
    })));

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
      app.addWarning(warnings.rebuildWarning());
    }
  });

  // Check for docker compat warnings and surface them nicely as well
  app.events.on('post-start', () => {
    _.forEach(_(lando.versions).filter(version => version.dockerVersion).value(), thing => {
      if (!thing.satisfied) app.addWarning(warnings.unsupportedVersionWarning(thing));
    });
  });

  // Scan urls
  app.events.on('post-start', 10, () => {
    // Message to let the user know it could take a bit
    console.log('Scanning to determine which services are ready... Please standby...');
    // Filter out any services where the scanner might be disabled
    return app.scanUrls(_.flatMap(getScannable(app), 'urls'), {max: 16}).then(urls => {
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

  // Reset app info on a stop, this helps prevent wrong/duplicate information being reported on a restart
  app.events.on('post-stop', () => lando.utils.getInfoDefaults(app));

  // Otherwise set on rebuilds
  // NOTE: We set this pre-rebuild because post-rebuild runs after post-start because you would need to
  // do two rebuilds to remove the warning since appWarning is already set by the time we get here.
  // Running pre-rebuild ensures the warning goes away but concedes a possible warning tradeoff between
  // this and a build step failure
  app.events.on('pre-rebuild', () => {
    lando.cache.set(app.metaCache, updateBuiltAgainst(app, app._config.version), {persist: true});
  });

  // Remove meta cache on destroy
  app.events.on('post-destroy', () => {
    app.log.debug('removing metadata cache...');
    lando.cache.remove(app.metaCache);
  });

  // REturn defualts
  return {
    env: {
      LANDO_APP_PROJECT: app.project,
      LANDO_APP_NAME: app.name,
      LANDO_APP_ROOT: app.root,
      LANDO_APP_ROOT_BIND: app.root,
      LANDO_LOAD_KEYS: getKeys(_.get(app, 'config.keys')),
      BITNAMI_DEBUG: 'true',
    },
    labels: {
      'io.lando.src': app.configFiles.join(','),
      'io.lando.http-ports': '80,443',
    },
  };
};
