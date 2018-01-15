/**
 * This does the service config parsin
 *
 * @name config
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var merger = lando.utils.merger;

  // Constants
  var landoBridgeNet = 'lando_bridge_network';

  // Let's also add in some config that we can pass down the stream
  lando.events.on('task-rebuild-run', function(options) {
    lando.events.on('post-instantiate-app', 9, function(app) {
      app.config._rebuildOnly = options.services || [];
    });
  });

  // Make sure we have a lando bridge network
  // We do this here so we can take advantage of docker up assurancs in engine.js
  // and to make sure it covers all non-app services
  lando.events.on('pre-engine-start', 1, function() {

    // Let's get a list of network
    return lando.networks.get()

    // Reduce to a true false so we know whether we need to create or not
    .reduce(function(bridged, network) {
      return bridged || (network.Name === landoBridgeNet);
    }, false)

    // Create if needed
    .then(function(bridged) {
      if (!bridged) {
        return lando.networks.create(landoBridgeNet);
      }
    });

  });

  // Do all the services magix
  lando.events.on('post-instantiate-app', 3, function(app) {

    // Check to see if we have any service definitions in our .lando.yml and parse
    // them into correct containers definition
    if (!_.isEmpty(app.config.services)) {
      _.forEach(app.config.services, function(service, name) {

        // Add some internal properties
        service._app = app.config.name;
        service._root = app.root;
        service._mount = app.mount;

        // Get our new containers
        var newCompose = lando.services.build(name, service.type, service);

        // Loop through and merge each service one in
        _.forEach(newCompose.services, function(service, name) {

          // Get our old container or empty object
          var oldService = app.services[name] || {};

          // Merge the new container on top of the old
          service = _.mergeWith(oldService, service, merger);

          // Clone deeply
          app.services[name] = _.cloneDeep(service);

        });

        // Merge in the volumes and networks as well
        app.volumes = _.mergeWith(app.volumes, newCompose.volumes, merger);
        app.networks = _.mergeWith(app.networks, newCompose.networks, merger);

        // Add in default network stuff
        // @TODO: putting this here for now because the next version will
        // feature some heavy refactoring and we will deal with it then
        var bridgeNet = {
          'lando_bridge': {
            external: {
              name: landoBridgeNet
            }
          }
        };
        app.networks = _.mergeWith(app.networks, bridgeNet, merger);

        // Go through all the services and add in the lando bridgenet
        _.forEach(app.services, function(service, name) {

          // Get the base networks
          service.networks = service.networks || {};

          // Collect aliases
          var defaultAlias = [name, app.name, 'internal'].join('.');
          var aliases = [defaultAlias];

          // Add in our aliases
          var bridge = {
            'lando_bridge': {
              aliases: aliases
            }
          };

          // Merge
          service.networks = _.merge(service.networks, bridge);

        });

      });

    }

    // Go through each config service and add additional info as needed
    app.events.on('pre-info', 1, function() {
      _.forEach(app.config.services, function(service, name) {

        // Merge in any computed service info with starting conf
        var config = _.mergeWith(app.services[name], service, merger);

        // Merge create the info for the service
        app.info[name] = lando.services.info(name, service.type, config);

        // Add in hostnames
        var alias = [name, app.dockerName, 'internal'].join('.');
        app.info[name].hostnames = [name];
        app.info[name].hostnames.push(alias);

      });
    });

    // Make sure we remove our build cache
    app.events.on('post-uninstall', function() {
      lando.cache.remove(app.name + ':last_build');
    });

    // Go through each service and run additional build commands as needed
    app.events.on('post-start', function() {

      /*
       * Helper to build out some runs
       */
      var buildRun = function(container, cmd, user) {
        return {
          id: container,
          cmd: cmd,
          compose: app.compose,
          project: app.name,
          opts: {
            app: app,
            mode: 'attach',
            user: user,
            services: [container.split('_')[1]]
          }
        };
      };

      // Start up a build collector and set target build services
      var build = [];
      var buildServices = app.config.services;

      // Check to see if we have to filter out build services
      // Currently this only exists so we can ensure lando rebuild's -s option
      // is respected re: build steps
      if (!_.isEmpty(_.get(app, 'config._rebuildOnly', []))) {
        var picker = _.get(app, 'config._rebuildOnly');
        buildServices = _.pick(buildServices, picker);
      }

      // Go through each service
      _.forEach(buildServices, function(service, name) {

        // Loop through both extras and build
        _.forEach(['extras', 'build'], function(section) {

          // If the service has extras let's loop through and run some commands
          if (!_.isEmpty(service[section])) {

            // Normalize data for loopage
            if (!_.isArray(service[section])) {
              service[section] = [service[section]];
            }

            // Run each command
            _.forEach(service[section], function(cmd) {

              // Get the user
              var userPath = 'environment.LANDO_WEBROOT_USER';
              var user = _.get(app.services[name], userPath, 'root');

              // Force root if we are doing extras
              var by = (section === 'extras') ? 'root' : user;

              // Get teh container name
              var container = [app.dockerName, name, '1'].join('_');

              // Push to the build
              build.push(buildRun(container, cmd, by));

            });

          }

        });

      });

      // Only proceed if build is non-empty
      if (!_.isEmpty(build)) {

        // Get the last build cache key
        var key = app.name + ':last_build';

        // Compute the build hash
        var newHash = lando.node.hasher(app.config.services);

        // If our new hash is different then lets build
        if (lando.cache.get(key) !== newHash) {

          // Set the new hash
          lando.cache.set(key, newHash, {persist:true});

          // Run all our post build steps serially
          return lando.engine.run(build);

        }

      }

    });

  });

};
