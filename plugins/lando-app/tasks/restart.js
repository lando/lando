'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var table = lando.cli.makeTable();
  var utils = lando.utils.app;

  // Task object
  return {
    command: 'restart [appname]',
    describe: 'Restarts app in current directory or [appname]',
    run: function(options) {

      // Try to get the app
      return lando.app.get(options.appname)

      // Resttart the app
      .then(function(app) {
        if (app) {

          // REstart the app
          return lando.app.restart(app)

          // Report the app has started and some extra info
          .then(function() {

            // Header it
            console.log(lando.cli.makeArt());

            // Inject start table into the table
            _.forEach(utils.startTable(app), function(value, key) {
              var opts = (_.includes(key, 'url')) ? {arrayJoiner: '\n'} : {};
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
