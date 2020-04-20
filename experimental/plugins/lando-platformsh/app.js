'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const utils = require('./lib/utils');

module.exports = (app, lando) => {
  // Only do this on platformsh recipes
  if (_.get(app, 'config.recipe') === 'platformsh') {
    // Add tokens and other meta to our app
    app.platformshTokenCache = 'platformsh.tokens';
    app.platformshTokens = lando.cache.get(app.platformshTokenCache) || [];
    // Reset the ID if we can
    app.id = _.get(app, 'config.config.id', app.id);

    // Grab platform config right away and add it to the apps config
    app.events.on('pre-init', 1, () => {
      // Name the conf files
      const appFile = path.join(app.root, '.platform.app.yaml');
      const routesFile = path.join(app.root, '.platform', 'routes.yaml');
      const servicesFile = path.join(app.root, '.platform', 'services.yaml');

      // Error if we don't have a platform.yml
      // @TODO eventually scan root and subdirs for app config and array it
      // so we can handle multiapp
      if (!fs.existsSync(appFile)) {
        lando.log.error(`Could not detect a .platform.app.yaml at ${appFile}`);
      }

      // Get the app config in there
      const configPath = path.join(app._config.userConfRoot, 'config', app.name);
      app.config = _.merge({}, app.config, {
        platformsh: {
          apps: [lando.yaml.load(appFile)],
          configPath,
          routes: {},
          services: {},
        },
      });

      // Load routes if we can
      if (fs.existsSync(routesFile)) {
        app.config.platformsh.routes = lando.yaml.load(routesFile);
      }
      // Load services if we can
      if (fs.existsSync(servicesFile)) {
        app.config.platformsh.services = lando.yaml.load(servicesFile);
      }

      // Make sure the config directory exists if it doesnt already
      if (!fs.existsSync(configPath)) mkdirp.sync(configPath);
    });

    // Generate the run config JSON for the services on "rebuildy" events
    app.events.on('post-init', () => {
      app.events.on('pre-start', 1, () => {
        if (!lando.cache.get(app.preLockfile)) {
          // Go through our platform config and generate an array of lando services
          // eg both apps and platform services
          const services = _(_.get(app, 'config.platformsh.apps', []))
            // Add some indicator that this is an app
            .map(app => _.merge({}, app, {application: true}))
            // Arrayify and merge in our services
            .concat(_(_.get(app, 'config.platformsh.services')).map((data, name) => _.merge({}, data, {name})).value())
            // Return
            .value();

          // Augment our platform config with a list of platform config files that we can
          // dump and then inject
          app.config.platformsh.configFiles = _(services)
            // map services into a bunch of data we can dump
            .map(service => ({
              service: service.name,
              application: service.application === true,
              file: path.join(app.config.platformsh.configPath, `${service.name}.json`),
              data: utils.getPlatformConfig(app, service),
            }))
            .value();

          // Dump all the config files so we can mount them
          _.forEach(app.config.platformsh.configFiles, service => {
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
