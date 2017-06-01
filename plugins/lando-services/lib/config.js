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

        // Add the appname to the service info
        service.app = app.config.name;

        // If we have sharing config let's also add that
        // @todo: this is weird since it crosses the plugin barrier
        if (lando.config.sharing === 'ON' && !_.isEmpty(app.config.sharing)) {
          service.sharing = app.config.sharing;
        }

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

      // Go through each service
      _.forEach(app.config.services, function(service, name) {

        // If the service has extras let's loop through and run some commands
        if (!_.isEmpty(service.extras)) {

          // Normalize data for loopage
          if (!_.isArray(service.extras)) {
            service.extras = [service.extras];
          }

          // Run each command
          _.forEach(service.extras, function(cmd) {

            // Build out the compose object
            var compose = {
              id: [app.dockerName, name, '1'].join('_'),
              cmd: cmd,
              opts: {
                mode: 'attach'
              }
            };

            // Push to the build
            build.push(compose);

          });

        }

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
