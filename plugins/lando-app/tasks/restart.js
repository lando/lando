'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const table = lando.cli.makeTable();
  const utils = lando.utils.app;
  // Task object
  return {
    command: 'restart [appname]',
    describe: 'Restarts app in current directory or [appname]',
    run: options => {
      // Try to get the app
      return lando.app.get(options.appname)
      // Resttart the app
      .then(app => {
        if (app) {
          // REstart the app
          return lando.app.restart(app)
          // Report the app has started and some extra info
          .then(() => {
            // Header it
            console.log(lando.cli.makeArt());
            // Inject start table into the table
            _.forEach(utils.startTable(app), (value, key) => {
              const opts = (_.includes(key, 'url')) ? {arrayJoiner: '\n'} : {};
              table.add(_.toUpper(key), value, opts);
            });

            // Print the table
            console.log(table.toString());
            console.log('');
          });
        } else {
          lando.log.warn('Could not find app in this dir');
        }
      });
    },
  };
};
