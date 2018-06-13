'use strict';

module.exports = function(lando) {

  // Modules
  var chalk = lando.node.chalk;
  var _ = require('lodash');
  var utils = require('./../lib/utils');
  var path = require('path');

  // The task object
  return {
    command: 'export [appname]',
    describe: 'Exports the docker compose yml for the current directory or [appname]',
    options: {
      destination: {
        describe: 'Path to the file to export the docker compose yml file.',
        alias: ['d']
      }
    },
    run: function(options) {

      // Try to get the app
      return lando.app.get(options.appname)

      // Restart the app
      .then(function(app) {
        if (app) {
          // Get our things
          var networks = app.networks || {};
          var services = app.services || {};
          var version = app.version;
          var volumes = app.volumes || {};
          var fileName = 'docker-compose.yml';
          var filePath = _.get(options, 'destination', path.join(app.root, fileName));

          // Get the compose object
          var compose = utils.compose(version, services, volumes, networks);

          // Write the services
          lando.yaml.dump(filePath, compose)
          console.log(chalk.green('Docker Compose file exported!'));
          return;
        }
        // Warn user we couldn't find an app
        else {
          lando.log.warn('Could not find app in this dir');
        }
      });

    }
  };

};
