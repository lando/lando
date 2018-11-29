'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const path = require('path');
  const table = lando.cli.makeTable();
  const utils = require('./../lib/utils');

  // Restart the app
  return {
    command: 'start [appname]',
    describe: 'Start app in current directory or [appname]',
    run: options => {
      // Try to get our app
      // @TODO: handle the appname if passed in?
      const file = path.resolve(process.cwd(), lando.config.landoFile);
      const app = lando.getApp(file);

      // Start it if we can!
      if (app) {
        return app.start().then(() => {
          // Header it
          console.log(lando.cli.makeArt());
          // Inject start table into the table
          _.forEach(utils.startTable(app), (value, key) => {
            const opts = (_.includes(key, 'urls')) ? {arrayJoiner: '\n'} : {};
            table.add(_.toUpper(key), value, opts);
          });
          // Print the table
          console.log(table.toString());
          console.log('');
        });
      }
    },
  };
};
