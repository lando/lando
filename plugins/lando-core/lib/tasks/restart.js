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

            // Spin up a url collector
            var urls = {};

            // Grab a new cli table
            var table = new lando.cli.Table();

            // Categorize and colorize URLS if and as appropriate
            _.forEach(app.info, function(info, service) {
              if (_.has(info, 'urls') && !_.isEmpty(info.urls))  {
                urls[service] = _.filter(app.urls, function(item) {
                  item.theme = chalk[item.color](item.url);
                  return _.includes(info.urls, item.url);
                });
              }
            });

            // Add generic data
            table.add('NAME', app.name);
            table.add('LOCATION', app.root);
            table.add('SERVICES', _.keys(app.services));

            // Add service URLS
            _.forEach(urls, function(items, service) {

              // Build table data
              var header = _.upperCase(service) + ' URLS';
              var data = _.map(items, 'theme');

              // And add to table
              table.add('', '');
              table.add(header, data, {arrayJoiner: '\n'});

            });

            // Print the table
            console.log(table.toString());

            // Give suggested next steps
            console.log('');
            console.log(
              'Use ' + chalk.bold('lando open') + ' to open your app.\n'
            );

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
