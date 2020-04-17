'use strict';

// Modules
const _ = require('lodash');

module.exports = (app, lando) => {
  // Only do this on platformsh recipes
  if (_.get(app, 'config.recipe') === 'platformsh') {
    // Add tokens and other meta to our app
    app.platformshTokenCache = 'platformsh.tokens';
    app.platformshTokens = lando.cache.get(app.platformshTokenCache) || [];

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
            user: 'root',
            services: [appserver],
            mode: 'attach',
            hijack: false,
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
