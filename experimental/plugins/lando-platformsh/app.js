'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');
const os = require('os');
const path = require('path');
const pshconf = require('./lib/config');
const runconf = require('./lib/run');
const utils = require('./lib/utils');

// Only do this on platformsh recipes
module.exports = (app, lando) => {
  if (_.get(app, 'config.recipe') === 'platformsh') {
    // Reset the ID if we can
    app.id = _.get(app, 'config.config.id', app.id);
    app.log.verbose('identified a platformsh app');
    app.log.debug('reset app id to %s', app.id);

    // Explicitly add a path for config and make sure it exists
    app.configPath = path.join(app._config.userConfRoot, 'config', app.name);
    if (!fs.existsSync(app.configPath)) mkdirp.sync(app.configPath);
    app.log.debug(`ensured ${app.configPath} exists`);

    // Start by loading in all the platform files we can
    app.platformsh = {config: pshconf.loadConfigFiles(app.root)};
    // And then augment with a few other things
    app.platformsh.domain = `${app.name}.${app._config.domain}`;
    app.platformsh.id = app.id;
    app.platformsh.tokenCache = 'platformsh.tokens';
    app.platformsh.tokens = lando.cache.get(app.platformsh.tokenCache) || [];
    app.log.silly('loaded platform config files', app.platformsh);

    /*
     * This event is intended to parse and interpret the platform config files
     * loaded above into things we can use elsewhere, eg if there is any useful
     * non-trivial data mutation that needs to happen ANYWHERE else in the
     * recipe it probably should happen here
     */
    app.events.on('pre-init', 1, () => {
      // Error if we don't have at least one .platform.app.yml
      if (_.isEmpty(app.platformsh.config.applications)) {
        lando.log.error(`Could not detect any valid .platform.app.yaml files in ${app.root} or its subdirs!`);
      }

      // Get the platform raw platform config
      const platformConfig = app.platformsh.config;

      // Add the parsed routes config
      app.platformsh.routes = pshconf.parseRoutes(platformConfig.routes, app.platformsh.domain);
      app.log.verbose('parsed platformsh routes');
      app.log.silly('platformsh routes are', app.platformsh.routes);

      // Add the parsed applications config
      // @TODO: the parsing here should happen
      app.platformsh.applications = pshconf.parseApps(platformConfig.applications);
      app.log.verbose('parsed platformsh applications');
      app.log.silly('platformsh applications are', app.platformsh.applications);

      // Add relationships keyed by the service name
      app.platformsh.relationships = pshconf.parseRelationships(platformConfig.applications);
      app.log.verbose('determined platformsh relationships');
      app.log.silly('platformsh relationships are', app.platformsh.relationships);

      // Add the parsed services config
      app.platformsh.services = pshconf.parseServices(platformConfig.services, app.platformsh.relationships);
      app.log.verbose('parsed platformsh services');
      app.log.silly('platformsh services ares', app.platformsh.services);

      // Go through our platform config and generate an array of configuration files for each
      // container so we can inject /run/config.json
      app.platformsh.runConfig = runconf.buildRunConfig(app);
      app.log.verbose('built platformsh config jsons');
      app.log.silly('generated platformsh runtime config is', app.platformsh.runConfig);
    });

    /*
     * This just makes sure we refresh the config we inject into /run/config.json when a first
     * start/rebuild happens
     */
    app.events.on('post-init', () => {
      app.events.on('pre-start', 1, () => {
        if (!lando.cache.get(app.preLockfile)) {
          _.forEach(app.platformsh.runConfig, service => {
            fs.writeFileSync(service.file, JSON.stringify(service.data));
            app.log.debug(`dumped platform config file for ${service.service} to ${service.file}`);
          });
        }
      });
    });

    // Handle the platform OPEN lifecycle event
    app.events.on('post-init', () => {
      // Get containers by type
      const appservers = utils.getContainersByType(app);
      const services = utils.getContainersByType(app, false);
      app.log.verbose('preparing to OPEN up platformsh containers...');
      app.log.debug('found platformsh appservers', appservers);
      app.log.debug('found platformsh services', services);

      // Open up services and collect their output
      app.events.on('post-start', 8, () => {
        return lando.Promise.map(services, service => lando.Promise.retry(() => lando.engine.run({
           id: `${app.project}_${service}_1`,
           cmd: ['/helpers/open-psh.sh', '{"relationships": {}}'],
           compose: app.compose,
           project: app.project,
           opts: {
             mode: 'attach',
             services: [service],
             user: 'root',
             noTTY: true,
             cstdio: ['ignore', 'pipe', 'ignore'],
             silent: true,
           },
        }))
        // Modify the data a bit so we can inject it better
        .then(data => {
          const cleanedData = _.last(data[0].split(os.EOL));
          app.log.verbose(`received data when opening ${service}`, cleanedData);
          try {
            return [service, JSON.parse(cleanedData)];
          } catch (e) {
            // @TODO: make this better
            app.log.warn('could not parse json', e, cleanedData);
          }
        }))
        // Inject it into each appserver
        .then(data => {
          // Mutate the data into something easier to use
          const serviceData = _.fromPairs(data);
          app.log.debug('collected open data from platform services', serviceData);

          // Open all the appservers
          return lando.Promise.map(appservers, appserver => {
            const appserverRelationships = utils.getApplicationRelationships(app, appserver);
            const openPayload = utils.generateOpenPayload(appserverRelationships, serviceData);
            app.log.verbose(`${appserver} has relationship config`, appserverRelationships);
            app.log.verbose(`generated open payload for ${appserver}`, openPayload);

            // OPEN
            return lando.engine.run({
              id: `${app.project}_${appserver}_1`,
              cmd: ['/helpers/open-psh.sh', JSON.stringify({relationships: openPayload})],
              compose: app.compose,
              project: app.project,
              opts: {
                hijack: false,
                services: [appserver],
                user: 'root',
                cstdio: ['inherit', 'pipe', 'pipe'],
                silent: true,
              },
            });
          });
        });
      });
    });
  }
};
