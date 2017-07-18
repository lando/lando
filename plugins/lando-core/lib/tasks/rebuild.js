/**
 * Command to restop a lando app
 *
 * @name restop
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var chalk = lando.node.chalk;

  // The task object
  return {
    command: 'rebuild [appname]',
    describe: 'Rebuilds app in current directory or [appname]',
    options: {
      yes: {
        describe: 'Auto answer yes to prompts',
        alias: ['y'],
        default: false,
        boolean: true,
        interactive: {
          type: 'confirm',
          message: 'Are you sure you want to rebuild?'
        }
      }
    },
    run: function(options) {

      // Stop rebuild if user decides its a nogo
      if (!options.yes) {
        console.log(chalk.yellow('Rebuild aborted'));
        return;
      }

      // Attempt to grab the app if we can
      return lando.app.get(options.appname)

      // Rebuild the app
      .then(function(app) {
        if (app) {
          return lando.app.rebuild(app)
          .then(function() {

            // Header it
            console.log(lando.cli.startHeader());

            // Rebuilt!
            console.log(chalk.yellow('App rebuilt!'));

            // Grab a new cli table
            var table = new lando.cli.Table();

            // Colorize URLS
            var urls = _.map(app.urls, function(url) {
              var uri = url.url;
              return (url.status) ? chalk.green(uri) : chalk.red(uri);
            });

            // Add data
            console.log('');
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
        // Warn user we couldn't find an app
        else {
          lando.log.warn('Could not find app in this dir');
        }
      });

    }
  };

};
