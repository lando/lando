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
  var dotenv = require('dotenv');
  var fs = lando.node.fs;
  var path = require('path');

  // Add in some high level config so our app can handle
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Add a process env object, this is to inject ENV into the process
    // running the app task so we cna use $ENVARS in our docker compose
    // files
    app.processEnv = {};

    // Add a env object, these are envvars that get added to every container
    // Mix in containerGlobalEnv
    app.env = _.merge(lando.config.containerGlobalEnv, {});

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
    app.env.LANDO_HOST_IP = lando.config.env.LANDO_ENGINE_REMOTE_IP;
    app.env.LANDO_APP_ROOT = app.rootBind;
    app.env.LANDO_APP_NAME = app.name;
    app.env.LANDO_WEBROOT_USER = 'www-data';
    app.env.LANDO_WEBROOT_GROUP = 'www-data';
    app.env.LANDO_WEBROOT_UID = '33';
    app.env.LANDO_WEBROOT_GID = '33';
    var ppk = lando.config.loadPassphraseProtectedKeys;
    app.env.LANDO_LOAD_PP_KEYS = _.toString(ppk);
    app.env.COLUMNS = 256;

    // Inject values from an .env file if it exists
    // Look for a .env file and inject its vars into the service as well
    if (fs.existsSync(path.join(app.root, '.env'))) {

      // Log
      lando.log.debug('.env file found for %s, loading its config', app.name);

      // Load .env file
      var result = dotenv.config();

      // warn if needed
      if (result.error) {
        lando.log.warn('Trouble parsing .env file with %s', result.error);
      }

      // Merge in values to app.env
      if (!_.isEmpty(result.parsed)) {
        app.env = _.merge(app.env, result.parsed);
      }

    }

    // Add in some global labels
    var labels = app.labels || {};
    app.labels = _.merge(labels, {'io.lando.container': 'TRUE'});

    // Add the global env object to all our services
    app.events.on('app-ready', function() {

      // Log
      lando.log.verbose('App %s has global env.', app.name, app.env);
      lando.log.verbose('App %s has global labels.', app.name, app.labels);
      lando.log.verbose('App %s adds process env.', app.name, app.processEnv);

      // If we have some services lets add in our global envs and labels
      if (!_.isEmpty(app.services)) {
        _.forEach(app.services, function(service, name) {

          // Get existing ENV and LABELS
          var env = service.environment || {};
          var labels = service.labels || {};

          // Add our env globals
          _.forEach(app.env, function(value, key) {
            env[key] = value;
          });
          service.environment = env;

          // Add our global labels
          _.forEach(app.labels, function(value, key) {
            labels[key] = value;
          });
          service.labels = labels;

          // Reset the app conatiner
          app.services[name] = _.cloneDeep(service);

        });

      }

    });

  });

};
