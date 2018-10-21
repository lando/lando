'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const table = lando.cli.makeTable();
  const utils = lando.utils.app;

  // Restart the app
  return {
    command: 'start [appname]',
    describe: 'Start app in current directory or [appname]',
    run: options => {
      // Try to get the app
      return lando.app.get(options.appname)

      // Start the app if we have one
      .then(app => {
        if (app) {
          // Start the app
          return lando.app.start(app)

          // Report the app has started and some extra info
          .then(() => {
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
        } else {
          lando.log.warn('Could not find app in this dir');
        }
      });
    },
  };
};
