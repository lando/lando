'use strict';

const utils = require('./../lib/utils');

module.exports = lando => {
  const table = lando.cli.makeTable();
  return {
    command: 'restart',
    describe: 'Restarts your app',
    run: options => {
      // Message
      // Try to get our app
      const app = lando.getApp(options._app.root);
      // Restart it if we can!
      if (app) {
        console.log(lando.cli.makeArt('appRestart', {name: app.name, phase: 'pre'}));
        return utils.appToggle(app, 'restart', table, lando.cli.makeArt('appRestart', {name: app.name, phase: 'post'}));
      }
    },
  };
};
