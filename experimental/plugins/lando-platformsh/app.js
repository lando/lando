'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

module.exports = (app, lando) => {
  // Only do this on platformsh recipes
  if (_.get(app, 'config.recipe') === 'platformsh') {
    // Add tokens and other meta to our app
    app.platformshTokenCache = 'platformsh.tokens';
    app.platformshTokens = lando.cache.get(app.platformshTokenCache) || [];

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
      app.config = _.merge({}, app.config, {
        platformsh: {apps: [lando.yaml.load(appFile)], routes: {}, services: {}},
      });

      // Load routes if we can
      if (fs.existsSync(routesFile)) {
        app.config.platformsh.routes = lando.yaml.load(routesFile);
      }
      // Load routes if we can
      if (fs.existsSync(servicesFile)) {
        app.config.platformsh.services = lando.yaml.load(servicesFile);
      }
    });

    // Generate the config JSON on "rebuildy" events

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
