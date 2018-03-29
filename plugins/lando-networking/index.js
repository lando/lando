'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Define the bridge network
  var landoNet = 'lando_bridge_network';

  // Make sure we have a lando bridge network
  // We do this here so we can take advantage of docker up assurancs in engine.js
  // and to make sure it covers all non-app services
  lando.events.on('pre-engine-start', 1, function() {

    // Let's get a list of network
    return lando.engine.getNetworks()

    // Try to find our net
    .then(function(networks) {
      return _.some(networks, function(network) {
        return network.Name === landoNet;
      });
    })

    // Create if needed
    .then(function(exists) {
      if (!exists) {
        return lando.engine.createNetwork(landoNet);
      }
    });

  });

  // Add all the apps containers to the lando bridge network after the app starts
  // @NOTE: containers are automatically removed when the app stops
  lando.events.on('post-instantiate-app', 1, function(app) {
    app.events.on('post-start', 1, function() {

      // We assume the lando net exists at this point
      // @todo: is it safe to use a name vs an id here?
      var landonet = lando.engine.getNetwork(landoNet);

      // List all our app containers
      return lando.engine.list(app.name)

      // Go through each container
      .each(function(container) {

        // Set useful things
        var alias = [container.service, container.app, 'interal'].join('.');
        var opts = {Container: container.id, EndpointConfig: {Aliases: [alias]}};

        // Sometimes you need to disconnect before you reconnect
        return landonet.disconnect(opts)

        // Only throw non not connected errors
        .catch(function(error) {
          if (!_.includes(error.message, 'is not connected to network lando')) {
            throw error;
          }
        })

        // Connect
        .then(function() {
          landonet.connect(opts);
          lando.log.info('Connected %s to the landonet', container.name);
        });

      });

    });
  });

};
