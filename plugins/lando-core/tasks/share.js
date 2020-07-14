'use strict';

module.exports = lando => {
  return {
    command: 'share',
    describe: 'Shares your local site publicly',
    run: options => {
      console.log(lando.cli.makeArt('shareWait'));
      /*
      if (u.parse(options.url).hostname !== 'localhost' || u.parse(options.url).protocol !== 'http:') {
        throw new Error('Need a url of the form http://localhost:port!');
      }
      // Try to get our app
      const app = lando.getApp(options._app.root);
      // Get the sharing url
      if (app) {
        console.log(lando.cli.makeArt('tunnel', {phase: 'pre'}));
        // Ensure the app is up and lets share
        return app.init().then(app => lando.metrics.report('share', {}))
        // Get the URLS
        .then(() => {
          const config = parseConfig(u.parse(options.url).port, _.lowerCase(app.name).replace(/[^0-9a-z]/g, ''));
          // Set up the localtunnel
          localtunnel(config.port, {subdomain: config.host}, (err, tunnel) => {
            // Error if needed
            if (err) lando.log.error(err);
            // Handler
            tunnelHandler(tunnel, lando);
          });
        });
      }
      */
    },
  };
};
