'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var chalk = lando.node.chalk;
  var localtunnel = require('localtunnel');
  var u = require('url');

  // Task object
  return {
    command: 'share [appname]',
    describe: 'Get a publicly available url',
    options: {
      url: {
        describe: 'Url to share. Needs to be in the form ' +
          'http://localhost:port',
        alias: ['u'],
        required: true
      }
    },
    run: function(options) {

      // Do some validation of the url
      var url = u.parse(options.url);

      // Validate URL
      var hnf = _.isEmpty(url.hostname) || url.hostname !== 'localhost';
      if (hnf || url.protocol !== 'http:') {
        throw new Error('Need a url of the form http://localhost:port!');
      }

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

          .then(function(app) {
            return lando.metrics.report('share', {});
          })

          // Get the URLS
          .then(function() {

            // Assume a port to start
            var port = 80;

            // Override port if specified
            if (!_.isEmpty(url.port)) {
              port = url.port;
            }

            // Translate the app.name into a localtunnel suitable address
            // eg lowercase/alphanumeric 4-63 chars
            // lowercase and alphanumeric it
            var tunnelHost = _.lowerCase(app.name).replace(/[^0-9a-z]/g, '');

            // Make sure we are at least 4 characters
            if (_.size(tunnelHost) <= 4) {
              tunnelHost = tunnelHost + 'xxxx';
            }

            // Makes sure we are at most 64 chars
            if (_.size(tunnelHost) >= 63) {
              tunnelHost = tunnelHost.substring(0, 57);
            }

            // Build opts array
            var opts = {subdomain: tunnelHost};

            // Set up the localtunnel
            var tunnel = localtunnel(port, opts, function(err, tunnel) {

              // Error if needed
              if (err) {
                lando.log.error(err);
              }

              // Header it
              console.log(lando.cli.makeArt('tunnel'));

              // the assigned public url for your tunnel
              // i.e. https://abcdefgjhij.localtunnel.me
              console.log(chalk.blue(tunnel.url));
              console.log('');
              console.log(chalk.yellow('Press any key to close the tunnel.'));

              // Set stdin to the correct mode
              // @todo: We will need to change this for better localdev gui usage
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
              process.stdin.pause();
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
