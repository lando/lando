/**
 * Command to print info about an app
 *
 * @name info
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var chalk = lando.node.chalk;
  var localtunnel = require('localtunnel');

  // Task object
  return {
    command: 'share [appname]',
    describe: 'Get a url to share your local site publicly',
    options: {
      service: {
        describe: 'Share a specific service',
        alias: ['s'],
        default: 'appserver'
      }
    },
    run: function(options) {

      // Service option
      var ltService = options.service || 'appserver';

      // Try to get the app
      return lando.app.get(options.appname)

      // Get the sharing url
      .then(function(app) {
        if (app) {

          // Start the app if needed
          return lando.app.isRunning(app)
          .then(function(isRunning) {
            if (!isRunning) {
              return lando.app.start(app);
            }
          })

          // Get the info
          .then(function() {
            return lando.app.info(app);
          })

          // Get the URLS
          .then(function(info) {

            // Collect appropriate URLS
            var urls = {};

            // Discover the URLs
            _.forEach(info, function(service, name) {
              if (!_.isEmpty(service.urls)) {
                urls[name] = _.filter(service.urls, function(url) {
                  return (_.includes(url, 'http://localhost'));
                });
              }
            });

            // Validate service
            if (!_.includes(_.keys(urls), ltService)) {

              // Warn the user
              lando.log.warn('%s has no valid urls.', ltService);
              lando.log.warn('Trying to discover some among %j', _.keys(urls));

              // Try the first service with a url
              // @TODO: make ths smarter
              ltService = _.keys(urls)[0];

            }

            // Get the port and opts
            var port = _.last(urls[ltService][0].split(':'));
            var opts = {subdomain: app.name};

            // Set up the localtunnel
            var tunnel = localtunnel(port, opts, function(err, tunnel) {

              // Error if needed
              if (err) {
                lando.log.error(err);
              }

              // Header it
              console.log(lando.cli.tunnelHeader());

              // the assigned public url for your tunnel
              // i.e. https://abcdefgjhij.localtunnel.me
              console.log(chalk.blue(tunnel.url));
              console.log('');
              console.log(chalk.yellow('Press any key to close the tunnel.'));

              // Set stdin to the correct mode
              process.stdin.resume();
              process.stdin.setEncoding('utf8');
              process.stdin.setRawMode(true);

              // Start the keypress listener for the process
              process.stdin.on('data', function() {
                tunnel.close();
              });

            });

            tunnel.on('close', function() {
              console.log('');
              console.log(chalk.green('Tunnel closed!'));
              process.exit(0);
            });

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
