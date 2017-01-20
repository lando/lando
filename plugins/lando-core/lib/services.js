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

    // Add an object to hold docker containers
    app.containers = {};

    // Check to see if we have any compose files in our .lando.yml and parse
    // them into our containers definition
    if (!_.isEmpty(app.config.compose)) {
      _.forEach(app.config.compose, function(compose) {
        if (fs.existsSync(path.join(app.root, compose))) {
          var composeFile = path.join(app.root, compose);
          lando.log.verbose('Adding compose file %s to app.', composeFile);
          var containers = fs.readFileSync(composeFile);
          app.containers = _.merge(app.containers, yaml.safeLoad(containers));
        }
      });
    }

    // Add the app object itself into the options
    app.events.on('app-ready', 9, function() {
      app.opts = {app: _.cloneDeep(app)};
    });

    // Parse whatever containers we might have into docker compose files
    app.events.on('app-ready', 9, function() {

      // If we have some containers lets parse them
      if (!_.isEmpty(app.containers)) {

        // Get project name
        var project = app.project || app.name;

        // Write the services
        var projectDir = path.join(lando.config.userConfRoot, 'tmp', project);
        var fileName = [project, _.uniqueId()].join('-');
        var file = path.join(projectDir, fileName + '.yml');

        // Add that file to our compose list
        app.compose.push(lando.utils.compose(file, app.containers));
        lando.log.verbose('App %s has compose files.', project, app.compose);

      }

    });

  });

};
