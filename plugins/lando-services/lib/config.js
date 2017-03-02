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
        var newContainers = lando.services.build(name, type, service);

        // Loop through and merge each one in
        _.forEach(newContainers, function(container, key) {

          // Get our old container or empty object
          var oldContainer = app.containers[key] || {};

          // Merge the new container ontop of the old
          container = _.merge(oldContainer, container);

          // Clone deeply
          app.containers[key] = _.cloneDeep(container);

        });

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

    /*
     * We don't want to uninstall our data container on a rebuild
     * so remove the data container from here
     *
     * NOTE: this is a nifty implementation where we inception some events
     * to target exactly what we want
     */
    app.events.on('pre-rebuild', function() {

      // We want to edit our engine remove things
      lando.events.on('pre-engine-destroy', function(data) {

        // Make sure opts is set
        data.opts = data.opts || {};

        // Remove the data element
        var withoutData = _.remove(_.keys(data.containers), function(name) {
          return name !== 'data';
        });

        // Log
        lando.log.debug('Removing data container from %s rebuild', app.name);

        // Update data to note remove data services on rebuilds
        data.opts.services = withoutData;

      });

    });

  });

};
