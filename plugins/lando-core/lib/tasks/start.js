/**
 * Command to start a lando app
 *
 * @name stop
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var chalk = lando.node.chalk;

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
            console.log(lando.cli.startHeader());

            // Grab a new cli table
            var table = new lando.cli.Table();

            // Colorize URLS
            var urls = _.map(app.urls, function(url) {
              var uri = url.url;
              return (url.status) ? chalk.green(uri) : chalk.red(uri);
            });

            // Add data
            table.add('NAME', app.name);
            table.add('LOCATION', app.root);
            table.add('SERVICES', _.keys(app.services));
            table.add('URLS', urls, {arrayJoiner: '\n'});

            // Print the table
            console.log(table.toString());

            // Space it
            console.log('');

          });

        }
      });

    }
  };

};
