'use strict';

const _ = require('lodash');
const utils = require('./../lib/utils');

module.exports = lando => {
  return {
    command: 'restart',
    describe: 'Restarts your app',
    run: options => {
      // Try to get our app
      const app = lando.getApp(options._app.root);
      // Restart it if we can!
      if (app) {
        console.log(lando.cli.makeArt('appRestart', {name: app.name, phase: 'pre'}));
        // Normal
        return app.restart().then(() => {
          const type = !_.isEmpty(app.warnings) ? 'report' : 'post';
          console.log(lando.cli.makeArt('appStart', {name: app.name, phase: type, warnings: app.warnings}));
          console.log(lando.cli.formatData(utils.startTable(app), {format: 'table'}, {border: false}));
          console.log('');
        })
        // Provide help if there is an error
        .catch(err => {
          app.log.error(err.message, err);
          console.log(lando.cli.makeArt('appStart', {phase: 'error'}));
          return lando.Promise.reject(err);
        });
      }
    },
  };
};
