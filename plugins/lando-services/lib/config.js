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

  });

};
