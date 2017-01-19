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
  var os = require('os');
  var Table = require('cli-table');

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

            // Start our jam
            var lines = [];

            // Paint a picture
            lines.push('');
            lines.push(chalk.green('BOOMSHAKALAKA!!!'));
            lines.push('');
            lines.push('Your app has started up correctly.');
            lines.push('Here are some vitals:');
            lines.push('');

            // Print it out
            console.log(lines.join(os.EOL));

            // Grab a new cli table
            // @todo: dump this in CORE at some point?
            var table = new Table({
              chars: {
                'top': '',
                'top-mid': '',
                'top-left': '',
                'top-right': '',
                'bottom': '',
                'bottom-mid': '',
                'bottom-left': '',
                'bottom-right': '',
                'left': '',
                'left-mid': '',
                'mid': '',
                'mid-mid': '',
                'right': '',
                'right-mid': '',
                'middle': ''
              }
            });

            // Add name and lcoation
            table.push([chalk.cyan('NAME'), app.name]);
            table.push([chalk.cyan('LOCATION'), app.root]);

            // List the containers
            var containers = _.keys(app.containers);
            table.push([chalk.cyan('CONTAINERS'), containers.join(', ')]);

            // Add URLS
            var urls = _.map(app.urls, function(url) {
              var uri = url.url;
              return (url.status) ? chalk.green(uri) : chalk.red(uri);
            });
            table.push([chalk.cyan('URLS'), urls.join(os.EOL)]);

            // Print the table
            console.log(table.toString());

            // SPace it
            console.log('');

          });

        }
      });

    }
  };

};
