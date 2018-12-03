'use strict';

const _ = require('lodash');
const chalk = require('chalk');
const localtunnel = require('localtunnel');
const path = require('path');
const u = require('url');

/*
 * Helper to define options
 */
const getOptions = () => ({
  url: {
    describe: 'Url to share. Needs to be in the form http://localhost:port',
    alias: ['u'],
    required: true,
  },
});

/*
 * Helper to get localtunnel config
 */
const parseConfig = (port = 80, host = 'localhost') => {
  // Set port to 80 if null
  if (_.isEmpty(80)) port = 80;
  // Make sure we are at least 4 characters
  if (_.size(host) <= 4) host = host + 'xxxx';
  // Makes sure we are at most 64 chars
  if (_.size(host) >= 63) host = host.substring(0, 57);
  return {port, host};
};

/*
 * Helper to manage the tunnel
 */
const tunnelHandler = (tunnel, header = '') => {
  // Header it
  console.log(header);
  // the assigned public url for your tunnel
  // i.e. https://abcdefgjhij.localtunnel.me
  console.log(chalk.blue(tunnel.url), '\n');
  console.log(chalk.yellow('Press any key to close the tunnel.'));
  // Set stdin to the correct mode
  // @todo: We will need to change this for better localdev gui usage
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.setRawMode(true);
  // Start the keypress listener for the process
  process.stdin.on('data', () => {
    tunnel.close();
  });

  // Close the process
  tunnel.on('close', () => {
    console.log(chalk.green('Tunnel closed!'));
    process.stdin.pause();
  });
};

module.exports = lando => {
  return {
    command: 'share',
    describe: 'Shares your local site publicly',
    options: getOptions(),
    run: options => {
      if (u.parse(options.url).hostname !== 'localhost' || u.parse(options.url).protocol !== 'http:') {
        throw new Error('Need a url of the form http://localhost:port!');
      }
      // Try to get our app
      const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile));
      console.log(chalk.green('About to share your app to the world!'));
      // Get the sharing url
      if (app) {
        // Ensure the app is up and lets share
        // @TODO: only start below if we need to
        return app.start().then(app => lando.metrics.report('share', {}))
        // Get the URLS
        .then(() => {
          const config = parseConfig(u.parse(options.url).port, _.lowerCase(app.name).replace(/[^0-9a-z]/g, ''));
          // Set up the localtunnel
          localtunnel(config.port, {subdomain: config.host}, (err, tunnel) => {
            // Error if needed
            if (err) lando.log.error(err);
            // Handler
            tunnelHandler(tunnel, lando.cli.makeArt('tunnel'));
          });
        });
      }
    },
  };
};
