'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const path = require('path');
  const table = lando.cli.makeTable();
  const utils = require('./../lib/utils');

  // Task object
  return {
    command: 'restart',
    describe: 'Restarts your app',
    run: options => {
      // Try to get our app
      const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile));
      // Restart it if we can!
      if (app) {
        return app.restart().then(() => {
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
