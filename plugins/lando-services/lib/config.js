/**
 * This does the service config parsin
 *
 * @name config
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

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
          service = _.merge(oldService, service);

          // Clone deeply
          app.services[name] = _.cloneDeep(service);

        });

        // Merge in the volumes and networks as well
        app.volumes = _.merge(app.volumes, newCompose.volumes);
        app.networks = _.merge(app.networks, newCompose.networks);

      });
    }

    // Go through each config service and add additional info as needed
    app.events.on('pre-info', 1, function() {
      _.forEach(app.config.services, function(service, name) {

        // Merge in any computed service info with starting conf
        var config = _.merge(app.services[name], service);

        // Merge create the info for the service
        app.info[name] = lando.services.info(name, service.type, config);

      });
    });

    // Make sure we remove our build cache
    app.events.on('post-uninstall', function() {
      lando.cache.remove(app.name + ':last_build');
    });

    // Go through each service and run additional build commands as needed
    app.events.on('post-start', function() {

      // Start up a build collector
      var build = [];

      /*
       * Helper to build out some runs
       */
      var buildRun = function(container, cmd, user) {
        return {
          id: container,
          cmd: cmd,
          opts: {
            mode: 'attach',
            user: user
          }
        };
      };

      // Go through each service
      _.forEach(app.config.services, function(service, name) {

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
