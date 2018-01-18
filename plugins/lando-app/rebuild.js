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
      services: {
        describe: 'Rebuild only the specified services',
        alias: ['s'],
        array: true
      },
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

          // Rebuild only particlar services if specified
          if (!_.isEmpty(options.services)) {
            app.opts.services = options.services;
          }

          return lando.app.rebuild(app)
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
                  var good = chalk.green(item.url);
                  var bad = chalk.red(item.url);
                  item.theme = (item.status) ? good : bad;
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
