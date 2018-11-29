'use strict';

module.exports = lando => ({
  command: 'logs [appname]',
  describe: 'Get logs for app in current directory or [appname]',
  options: {
    follow: {
      describe: 'Follow the logs',
      alias: ['f'],
      default: false,
      boolean: true,
    },
    services: {
      describe: 'Show logs for the specified services only',
      alias: ['s'],
      array: true,
    },
    timestamps: {
      describe: 'Show log timestamps',
      alias: ['t'],
      default: false,
      boolean: true,
    },
  },
  run: options => {
    // Try to get the app if we can
    return lando.app.get(options.appname)
    // Destroy the app
    .then(app => {
      if (app) {
        // Add opts to our app
        app.opts.follow = options.follow;
        app.opts.timestamps = options.timestamps;
        app.opts.services = options.services;
        // Get the logs
        return lando.engine.logs(app);
      } else {
        lando.log.warn('Could not find app in this dir');
      }
    });
  },
});
