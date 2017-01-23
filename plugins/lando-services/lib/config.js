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
        app.containers[name] = lando.services.build(service.type, service);
      });
    }

    // Add services to our app as needed
    app.events.on('app-info', function() {

      //console.log(app.info);

    });

  });

};
