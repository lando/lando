/**
 * Our app plugin
 *
 * @name app
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var path = require('path');

  // Add some config for the engine
  lando.events.on('post-bootstrap', 1, function(lando) {

    // Log
    lando.log.info('Configuring app plugin');

    // Build the default config object
    var defaultAppConfig = {
      appConfigFilename: '.lando.yml',
      appsRoot: path.join(lando.config.home, 'Lando'),
      appRegistry: 'registry',
    };

    // Merge defaults over the config, this allows users to set their own things
    lando.config = lando.utils.config.merge(defaultAppConfig, lando.config);

    // Log it
    lando.log.verbose('App plugin configured with %j', lando.config);

    // Add utilities
    lando.utils.app = require('./lib/utils');

  });

  // Add some config for the engine
  lando.events.on('post-bootstrap', 2, function(lando) {

    // Log
    lando.log.info('Initializing app plugin');

    // Add the app module
    lando.app = require('./app')(lando);

  });

  // Add in our app tasks
  lando.events.on('post-bootstrap', function(lando) {
    lando.tasks.add('destroy', require('./tasks/destroy')(lando));
    lando.tasks.add('info', require('./tasks/info')(lando));
    lando.tasks.add('list', require('./tasks/list')(lando));
    lando.tasks.add('logs', require('./tasks/logs')(lando));
    lando.tasks.add('poweroff', require('./tasks/poweroff')(lando));
    lando.tasks.add('rebuild', require('./tasks/rebuild')(lando));
    lando.tasks.add('restart', require('./tasks/restart')(lando));
    lando.tasks.add('share', require('./tasks/share')(lando));
    lando.tasks.add('start', require('./tasks/start')(lando));
    lando.tasks.add('stop', require('./tasks/stop')(lando));
  });

  // Do last minute processing
  lando.events.on('post-instantiate-app', 1, function(app) {
    app.events.on('app-ready', 9, function() {

      // Figure out the compose files
      app.compose = _.compact(_.map(app.compose, function(file) {

        // Normalise
        if (!path.isAbsolute(file)) {
          file = path.join(app.root, file);
        }

        // Check existence
        if (fs.existsSync(file)) {
          return file;
        }

      }));

      // Clone the app object in as opts
      // This helps when passing through to ohter things
      app.opts = {app: _.cloneDeep(app)};

    });
  });

};
