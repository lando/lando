'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');
const os = require('os');
const path = require('path');
const utils = require('./lib/utils');

// Constants
const platformshTokenCache = 'platformsh.tokens';

module.exports = (app, lando) => {
  // Only do this on platformsh recipes
  if (_.get(app, 'config.recipe') === 'platformsh') {
    // Reset the ID if we can
    app.id = _.get(app, 'config.config.id', app.id);
    // Get paths to platform files
    const routesFile = path.join(app.root, '.platform', 'routes.yaml');
    const servicesFile = path.join(app.root, '.platform', 'services.yaml');
    app.log.verbose('identified a platformsh app');

    // Add tokens and other meta to our app, at this point we are not parsing anything
    // we are just loading things as is
    app.platformsh = {
      config: {
        applications: _(fs.readdirSync(app.root, {withFileTypes: true}))
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name)
          .concat('.')
          .map(directory => path.resolve(app.root, directory, '.platform.app.yaml'))
          .filter(file => fs.existsSync(file))
          .map(file => lando.yaml.load(file))
          .value(),
        routes: (fs.existsSync(routesFile)) ? lando.yaml.load(routesFile) : {},
        services: (fs.existsSync(servicesFile)) ? lando.yaml.load(servicesFile) : {},
      },
      id: app.id,
      tokenCache: platformshTokenCache,
      tokens: lando.cache.get(platformshTokenCache) || [],
    };
    app.log.silly('loaded platform config', app.platformsh);

    // Grab platform config right away and add it to the apps config
    app.events.on('pre-init', 1, () => {
      // Error if we don't have at least one .platform.app.yml
      if (_.isEmpty(app.platformsh.config.applications)) {
        lando.log.error(`Could not detect any valid .platform.app.yaml files in ${app.root} or its subdirs!`);
      }

      // Parse the routes config and add it
      app.platformsh.routes = utils.parseRoutes(app.platformsh.config.routes, `${app.name}.${app._config.domain}`);
      app.log.verbose('parsed platformsh routes');
      app.log.silly('platformsh routes are', app.platformsh.routes);

      // Just pass the services through
      app.platformsh.services = app.platformsh.config.services;
      app.log.verbose('parsed platformsh services');
      app.log.silly('platformsh services ares', app.platformsh.services);

      // Parse the applications and add those as well
      app.platformsh.applications = _(app.platformsh.config.applications)
        .map(data => utils.getApplicationConfig(data, app.platformsh))
        .value();
      app.log.verbose('parsed platformsh applications');
      app.log.silly('platformsh applications are', app.platformsh.applications);

      // Get the default config in there
      const configPath = path.join(app._config.userConfRoot, 'config', app.name);
      // Make sure the config directory exists if it doesnt already
      if (!fs.existsSync(configPath)) mkdirp.sync(configPath);
      app.log.debug(`ensured ${configPath} exists`);

      // Go through our platform config and generate an array of configuration files for each
      // container so we can inject /run/config.json
      app.platformsh.runConfig = _(_.get(app, 'platformsh.config.applications', []))
        // Add some indicator that this is an app
        .map(app => _.merge({}, app, {application: true}))
        // Arrayify and merge in our services
        .concat(_(_.get(app, 'platformsh.config.services', {})).map((data, name) => _.merge({}, data, {name})).value())
        // Map into the full blown config
        .map(service => ({
          service: service.name,
          application: service.application === true,
          file: path.join(configPath, `${service.name}.json`),
          data: utils.getPlatformConfig(app, service),
        }))
        // Return
        .value();
      app.log.verbose('built platformsh config jsons');
      app.log.silly('generated platformsh runtime config is', app.platformsh.runConfig);
    });

    // Handle the platform BOOT lifecycle event
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
      // @TODO: util to get containers
      // @TODO: util for an "open" run
      // Get all containers
      const containers = _(_.get(app, 'config.services', {}))
        .map((data, name) => ({name, appserver: data.appserver}))
        .value();
      // Get service containers
      const services = _(containers)
        .filter(service => !service.appserver)
        .map(service => service.name)
        .value();
      // Get application containers
      const appservers = _(containers)
        .filter(service => service.appserver)
        .map(service => service.name)
        .value();

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
        // @TODO: We need to handle failure way better
        // @TODO: probably util to handle all the crazy here
        // @TODO: need to merge more stuff into data eg host
        .then(data => {
          // LOG things better
          console.log(data);
          const openJSON = _.last(data[0].split(os.EOL));
          return [service, JSON.parse(openJSON)];
        }))
        // Inject it into each appserver
        .then(data => {
          // Mutate the data into something easier to use
          const relationships = _.fromPairs(data);
          // Open all the appservers
          return lando.Promise.map(appservers, appserver => {
            const appserverConfig = _.find(app.platformsh.runConfig, {service: appserver});
            const relationshipConfig = _.find(appserverConfig.data.applications, application => {
              return application.configuration.name = appserver;
            });
            const openData = {};
            _.forEach(relationshipConfig.configuration.relationships, (value, name) => {
              const service = value.split(':')[0];
              const endpoint = value.split(':')[1];
              openData[name] = [_.merge({}, relationships[service][endpoint], {host: `${service}.internal`})];
            });
            return lando.engine.run({
              id: `${app.project}_${appserver}_1`,
              cmd: ['/helpers/open-psh.sh', JSON.stringify({relationships: openData})],
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
        })

        .catch(err => {
          // @TODO: make this a warning
          // lando.log.error('Looks like %s is not running! It should be so this is a problem.', appserver);
          // lando.log.warn('Try running `lando logs -s %s` to help locate the problem!', appserver);
          // lando.log.debug(err.stack);
          console.error(err);
          return lando.Promise.reject(err);
        });
      });
    });
  }
};
