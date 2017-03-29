/**
 * This adds basic app service parsing
 *
 * Specifically, it handles a "compose" option in the app config which is an
 * array of files. It is also responsible for parsing
 *
 * @name services
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var path = require('path');
  var yaml = lando.node.yaml;

  // Add in some high level config so our app can handle parsing container objects
  // and compose files
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Add a project name to the app
    app.project = app.name;

    // Add an array to ultimately hold compose files
    app.compose = [];

    // Add an object to hold docker compose services, volumes and networks
    // for now we mostly care about services
    app.services = {};
    app.volumes = {};
    app.networks = {};

    // Check to see if we have any compose files in our .lando.yml and parse
    // them into the relevant compose definitions
    if (!_.isEmpty(app.config.compose)) {
      _.forEach(app.config.compose, function(compose) {

        // GEt the file
        var composeFile = path.join(app.root, compose);

        // If it exists import as needed
        if (fs.existsSync(composeFile)) {

          // Get our object from file
          var data = yaml.safeLoad(fs.readFileSync(composeFile));

          // Merge things in
          app.services = _.merge(app.services, data.services);
          app.volumes = _.merge(app.volumes, data.volumes);
          app.networks = _.merge(app.networks, data.networks);

          // Log
          lando.log.verbose('Added compose file %s to app.', composeFile);

        }
      });
    }

    // Add the app object itself into the options
    app.events.on('app-ready', 9, function() {
      app.opts = {app: _.cloneDeep(app)};
    });

    // Parse whatever services we might have into docker compose files
    app.events.on('app-ready', 9, function() {

      // If we have some services lets parse them
      if (!_.isEmpty(app.services)) {

        // Get project name
        var project = app.project || app.name;

        // Write the services
        var projectDir = path.join(lando.config.userConfRoot, 'tmp', project);
        var fileName = [project, _.uniqueId()].join('-');
        var file = path.join(projectDir, fileName + '.yml');

        // Add that file to our compose list
        app.compose.push(lando.utils.compose(file, app.services));
        lando.log.verbose('App %s has compose files.', project, app.compose);

      }

    });

  });

};
