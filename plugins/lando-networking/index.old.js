'use strict';

// Modules
const _ = require('lodash');

module.exports = lando => {
  // Preemptively make sure we have enough networks and if we dont
  // smartly prune some of them
  lando.events.on('pre-engine-start', 1, () => {
    // Let's get a list of network
    return lando.engine.getNetworks()
    // If we are at the threshold lets engage some pruning ops
    .then(networks => {
      if (_.size(networks) >= 32) {
        // Warn user about this action
        lando.log.warn('Lando has detected you are at Docker\'s network limit!');
        lando.log.warn('Give us a moment as we try to make space by cleaning up old networks...');
        // List of default networks we can assume
        const landoNets = ['bridge', 'host', 'none', lando.config.networkBridge];
        // Add in proxyNet if we have if
        if (_.has(lando, 'config.proxyNet')) landoNets.push(lando.config.proxyNet);
        // Get list of app default networks
        return lando.app.list()
        // And add them to our default list
        .each(app => {
          landoNets.push(app.lando + '_default');
        })
        // Map some networks
        .then(() => networks)
        // Filter out any landoy ones
        .filter(network => !_.includes(landoNets, network.Name))
        // Inspect remaining networks to make sure we dont remove any
        // with attached containers
        .map(network => lando.engine.getNetwork(network.Id))
        .map(network => network.inspect())
        // Filter out any with containers
        .filter(network => _.isEmpty(network.Containers))
        // Return the oldest 5 unused networks
        // @todo: what is the best assumption here?
        .then(networks => _.slice(_.orderBy(networks, 'Created', 'asc'), 0, 5))
        // Get the Network object
        .map(network => lando.engine.getNetwork(network.Id))
        // and remove it
        .each(net => {
          lando.log.warn('Removing old network %s', net.id);
          net.remove();
        });
      }
    });
  });

  // Make sure we have a lando bridge network
  // We do this here so we can take advantage of docker up assurancs in engine.js
  // and to make sure it covers all non-app services
  lando.events.on('pre-engine-start', 2, () => {
    // Let's get a list of network
    return lando.engine.getNetworks()
    // Try to find our net
    .then(networks => _.some(networks, network => network.Name === lando.config.networkBridge))
    // Create if needed
    .then(exists => {
      if (!exists) {
        return lando.engine.createNetwork(lando.config.networkBridge);
      }
    });
  });

  // Add all the apps containers to the lando bridge network after the app starts
  // @NOTE: containers are automatically removed when the app stops
  lando.events.on('post-instantiate-app', 1, app => {
    app.events.on('post-start', 1, () => {
      // We assume the lando net exists at this point
      // @todo: is it safe to use a name vs an id here?
      const landonet = lando.engine.getNetwork(lando.config.networkBridge);
      // List all our app containers
      return lando.engine.list(app.name)
      // Go through each container
      .each(container => {
        // Set useful defaults
        const service = container.service;
        let aliases = [[service, container.app, 'internal'].join('.')];

        // Add in any additional aliases if we have proxy settings
        if (_.has(app, 'config.proxy.' + service)) {
          const proxies = _.get(app, 'config.proxy.' + service);
          if (!_.isNil(proxies) && _.isString(proxies[0])) {
            aliases = _.compact(aliases.concat(proxies));
          }
        }

        // Build out our options
        const opts = {Container: container.id, EndpointConfig: {Aliases: aliases}};

        // Sometimes you need to disconnect before you reconnect
        return landonet.disconnect(opts)

        // Only throw non not connected errors
        .catch(error => {
          if (!_.includes(error.message, 'is not connected to network lando')) {
            throw error;
          }
        })

        // Connect
        .then(() => {
          landonet.connect(opts);
          lando.log.info('Connected %s to the landonet', container.name);
        });
      });
    });
  });

  // Add the hostname to the info
  lando.events.on('post-instantiate-app', app => {
    app.events.on('post-info', () => {
      _.forEach(app.info, (data, name) => {
        data.hostnames = _.get(data, 'hostnames', []);
        data.hostnames.push([name, app.name, 'internal'].join('.'));
      });
    });

    // Start up a build collector and set target build services
    let buildServices = app.config.services;
    // Check to see if we have to filter out build services
    // Currently this only exists so we can ensure lando rebuild's -s option
    // is respected re: build steps
    if (!_.isEmpty(_.get(app, 'config._rebuildOnly', []))) {
      const picker = _.get(app, 'config._rebuildOnly');
      buildServices = _.pick(buildServices, picker);
    }

    app.events.on('app-ready', 9, () => {
      app.events.on('post-start', 9999, () => runRoot(buildServices, '/helpers/refresh-certs.sh > /cert-log.txt', app));
    });
  });
};
