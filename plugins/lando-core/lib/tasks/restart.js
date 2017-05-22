/**
 * Command to restop a lando app
 *
 * @name restart
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var chalk = lando.node.chalk;

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
