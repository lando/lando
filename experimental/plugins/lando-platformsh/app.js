'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');
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

    // Grab platform config right away and add it to the apps config
    app.events.on('pre-init', 1, () => {
      // Error if we don't have at least one .platform.app.yml
      if (_.isEmpty(app.platformsh.config.applications)) {
        lando.log.error(`Could not detect any valid .platform.app.yaml files in ${app.root} or its subdirs!`);
      }

      // Parse the routes config and add it
      app.platformsh.routes = utils.parseRoutes(app.platformsh.config.routes, `${app.name}.${app._config.domain}`);
      // Just pass the services through
      app.platformsh.services = app.platformsh.config.services;
      // Parse the applications and add those as well
      app.platformsh.applications = _(app.platformsh.config.applications)
        .map(data => utils.getApplicationConfig(data, app.platformsh))
        .value();

      // Get the default config in there
      const configPath = path.join(app._config.userConfRoot, 'config', app.name);
      // Make sure the config directory exists if it doesnt already
      if (!fs.existsSync(configPath)) mkdirp.sync(configPath);

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
    });

    // Dump the run config JSON for the services on "rebuildy" events
    app.events.on('post-init', () => {
      app.events.on('pre-start', 1, () => {
        if (!lando.cache.get(app.preLockfile)) {
          _.forEach(app.platformsh.runConfig, service => {
            fs.writeFileSync(service.file, JSON.stringify(service.data));
          });
        }
      });
    });

    // Open application servers up before we scan URLS
    app.events.on('post-init', () => {
      app.events.on('post-start', 8, () => {
        // Get appservers
        const appservers = _(_.get(app, 'config.services', {}))
          .map((data, name) => _.merge({}, data, {name}))
          .filter(service => service.appserver)
          .map(service => service.name)
          .value();

        // Open them
        return lando.Promise.each(appservers, appserver => lando.engine.run({
          id: `${app.project}_${appserver}_1`,
          cmd: 'sleep 1 && /helpers/open-psh.sh',
          compose: app.compose,
          project: app.project,
          opts: {
            hijack: false,
            services: [appserver],
            user: 'root',
          },
        })
        .catch(err => {
          // @TODO: make this a warning
          lando.log.error('Looks like %s is not running! It should be so this is a problem.', appserver);
          lando.log.warn('Try running `lando logs -s %s` to help locate the problem!', appserver);
          lando.log.debug(err.stack);
          return lando.Promise.reject(err);
        }));
      });
    });
  }
};
