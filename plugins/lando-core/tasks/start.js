'use strict';

const utils = require('./../lib/utils');

module.exports = lando => {
  const table = lando.cli.makeTable();
  return {
    command: 'start',
    describe: 'Starts your app',
    run: options => {
      // Try to get our app
      const app = lando.getApp(options._app.root);
      // Start it if we can!
      if (app) {
        console.log(lando.cli.makeArt('appStart', {name: app.name, phase: 'pre'}));
        return utils.appToggle(app, 'start', table, lando.cli.makeArt('appStart', {name: app.name, phase: 'post'}));
      }
    },
  };
};
