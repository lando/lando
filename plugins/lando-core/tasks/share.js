'use strict';

const localtunnel = require('localtunnel');
const path = require('path');
const u = require('url');

module.exports = lando => {
  const _ = lando.node._;
  const chalk = lando.node.chalk;
  return {
    command: 'share',
    describe: 'Shares your local site publicly',
    options: {
      url: {
        describe: 'Url to share. Needs to be in the form http://localhost:port',
        alias: ['u'],
        required: true,
      },
    },
    run: options => {
      // Do some validation of the url
      const url = u.parse(options.url);
      // Validate URL
      if (url.hostname !== 'localhost' || url.protocol !== 'http:') {
        throw new Error('Need a url of the form http://localhost:port!');
      }
      // Try to get our app
      const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile));
      console.log(chalk.green('About to share your app to the world!'));
      // Get the sharing url
      if (app) {
        // Ensure the app is up and lets share
        // @TODO: only do below if we need to
        return app.start().then(app => lando.metrics.report('share', {}))
        // Get the URLS
        .then(() => {
          // Get the port
          const port = (!_.isEmpty(url.port)) ? url.port : '80';
          // Translate the app.name into a localtunnel suitable address
          // eg lowercase/alphanumeric 4-63 chars
          // lowercase and alphanumeric it
          let tunnelHost = _.lowerCase(app.name).replace(/[^0-9a-z]/g, '');
          // Make sure we are at least 4 characters
          if (_.size(tunnelHost) <= 4) tunnelHost = tunnelHost + 'xxxx';
          // Makes sure we are at most 64 chars
          if (_.size(tunnelHost) >= 63) tunnelHost = tunnelHost.substring(0, 57);
          // Set up the localtunnel
          const tunnel = localtunnel(port, {subdomain: tunnelHost}, (err, tunnel) => {
            // Error if needed
            if (err) lando.log.error(err);
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

          // Close the process
          tunnel.on('close', function() {
            console.log('');
            console.log(chalk.green('Tunnel closed!'));
            process.stdin.pause();
          });
        });
      }
    },
  };
};
