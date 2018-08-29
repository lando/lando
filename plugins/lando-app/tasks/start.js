'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var table = lando.cli.makeTable();
  var utils = lando.utils.app;

  // Restart the app
  return {
    command: 'start [appname]',
    describe: 'Start app in current directory or [appname]',
    run: function(options) {

      // Try to get the app
      return lando.app.get(options.appname)

      // Start the app if we have one
      .then(function(app) {
        if (app) {

          // Start the app
          return lando.app.start(app)

          // Report the app has started and some extra info
          .then(function() {

            // Header it
            console.log(lando.cli.makeArt());

            // Inject start table into the table
            _.forEach(utils.startTable(app), function(value, key) {
              var opts = (_.includes(key, 'urls')) ? {arrayJoiner: '\n'} : {};
              table.add(_.toUpper(key), value, opts);
            });

            // Print the table
            console.log(table.toString());
            console.log('');

          });

        }
        // Warn user we couldn't find an app
        else {
          lando.log.warn('Could not find app in this dir');
        }
      });

    }
  };

};
