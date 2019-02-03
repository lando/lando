'use strict';

const _ = require('lodash');

module.exports = lando => ({
  command: 'logs',
  describe: 'Displays logs for your app',
  options: {
    follow: {
      describe: 'Follow the logs',
      alias: ['f'],
      default: false,
      boolean: true,
    },
    service: {
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
    // Try to get our app
    const app = lando.getApp(options._app.root);
    const opts = _.pick(options, ['follow', 'timestamps', 'service']);
    opts.services = opts.service;
    if (app) return app.init().then(() => lando.engine.logs(_.merge(app, {opts})));
  },
});
