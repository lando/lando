'use strict';

const _ = require('lodash');
const utils = require('./../lib/utils');

module.exports = lando => {
  return {
    command: 'rebuild',
    describe: 'Rebuilds your app from scratch, preserving data',
    options: {
      service: {
        describe: 'Rebuild only the specified services',
        alias: ['s'],
        array: true,
      },
      yes: lando.cli.confirm('Are you sure you want to rebuild?'),
    },
    run: options => {
      if (!options.yes) {
        console.log(lando.cli.makeArt('appRebuild', {phase: 'abort'}));
        return;
      }
      // Try to get our app
      const app = lando.getApp(options._app.root);
      // Rebuild the app
      if (app) {
        // If user has given us options then set those
        if (!_.isEmpty(options.service)) {
          app.opts = _.merge({}, app.opts, {services: options.service});
        }
        console.log(lando.cli.makeArt('appRebuild', {name: app.name, phase: 'pre'}));
        return app.rebuild().then(() => {
          const type = !_.isEmpty(app.warnings) ? 'report' : 'post';
          console.log(lando.cli.makeArt('appRebuild', {name: app.name, phase: type, warnings: app.warnings}));
          console.log(lando.cli.formatData(utils.startTable(app), {format: 'table'}, {border: false}));
          console.log('');
        });
      }
    },
  };
};
