/**
 * This adds basic app env parsing
 *
 * Specifically, it handles a "compose" option in the app config which is an
 * array of files. It is also responsible for parsing
 *
 * @name env
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Add in some high level config so our app can handle
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Add a process env object, this is to inject ENV into the process
    // running the app task so we cna use $ENVARS in our docker compose
    // files
    app.processEnv = {};

    // Add a env object, these are envvars that get added to every container
    app.env = {};

    // Add a label object, these are labels that get added to every container
    app.labels = {};

    // Add in some common process envvars we might want
    app.processEnv.LANDO_APP_NAME = app.name;
    app.processEnv.LANDO_APP_ROOT = app.root;
    app.processEnv.LANDO_APP_ROOT_BIND = app.rootBind;

    // Add in some global container envvars
    app.env.LANDO = 'ON';
    app.env.LANDO_HOST_OS = lando.config.os.platform;
    app.env.LANDO_HOST_UID = lando.config.engineId;
    app.env.LANDO_HOST_GID = lando.config.engineGid;

    // Add in some global labels
    app.labels = {'io.lando.container': 'TRUE'};

    // Add the global env object to all our containers
    app.events.on('app-ready', function() {

      // Log
      lando.log.verbose('App %s has global env.', app.name, app.env);
      lando.log.verbose('App %s has global labels.', app.name, app.labels);
      lando.log.verbose('App %s adds process env.', app.name, app.processEnv);

      // If we have some containers lets add in our global envs and labels
      if (!_.isEmpty(app.containers)) {
        _.forEach(app.containers, function(container, service) {

          // Get existing ENV and LABELS
          var env = container.environment || {};
          var labels = container.labels || {};

          // Add our env globals
          _.forEach(app.env, function(value, key) {
            env[key] = value;
          });
          container.environment = env;

          // Add our global labels
          _.forEach(app.labels, function(value, key) {
            labels[key] = value;
          });
          container.labels = labels;

          // Reset the app conatiner
          app.containers[service] = _.cloneDeep(container);

        });

      }

    });

  });

};
