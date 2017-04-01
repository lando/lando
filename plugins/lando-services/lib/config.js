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

        // Get our new containers
        var type = service.type;
        var newCompose = lando.services.build(name, type, service);

        // Loop through and merge each service one in
        _.forEach(newCompose.services, function(service, name) {

          // Get our old container or empty object
          var oldService = app.services[name] || {};

          // Merge the new container ontop of the old
          service = _.merge(oldService, service);

          // Clone deeply
          app.services[name] = _.cloneDeep(service);

        });

        // Merge in the volumes and networks as well
        app.volumes = _.merge(app.volumes, newCompose.volumes);
        app.networks = _.merge(app.networks, newCompose.networks);

      });
    }

    // Add types to our app as needed
    app.events.on('pre-info', function() {

      // Go through each container and get and set the type
      _.forEach(app.info, function(container, key) {
        var type = _.get(app, 'config.services.' + key + '.type', 'custom');
        app.info[key].type = type;
      });

    });

  });

};
