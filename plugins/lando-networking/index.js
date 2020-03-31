'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to clean out any old networks when we hit the limit
 */
const cleanNetworks = lando => lando.engine.getNetworks()
  .then(networks => {
    if (_.size(networks) >= 32) {
      // Warn user about this action
      lando.log.warn('Lando has detected you are at Docker\'s network limit!');
      lando.log.warn('Give us a moment as we try to make space by cleaning up old networks...');
      // Go through lando containers and add in networks
      return lando.engine.list()
      .filter(container => container.kind === 'app')
      // And add them to our default list
      .map(container => `${container.app}_default`)
      .then(networks => {
        const nets = _.uniq(networks).concat(['bridge', 'host', 'none', lando.config.networkBridge]);
        if (_.has(lando, 'config.proxyNet')) nets.push(lando.config.proxyNet);
        return nets;
      })
      // Filter out landoy ones
      .then(nets => _.filter(networks, network => !_.includes(nets, network.Name)))
      // Inspect remaining networks to make sure we don't remove any with attached containers
      .map(network => lando.engine.getNetwork(network.Id))
      .map(network => network.inspect())
      // Filter out any with containers
      .filter(network => _.isEmpty(network.Containers))
      // Return the oldest 5 unused networks
      // @TODO: what is the best assumption here?
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

module.exports = lando => {
  // Preemptively make sure we have enough networks and if we don't smartly prune some of them
  lando.events.on('pre-engine-start', 1, () => cleanNetworks(lando));

  // Assess whether we need to upgrade the lando network or not
  lando.events.on('pre-engine-start', 2, () => {
    if (lando.versions.networking === 1) {
      lando.log.warn('Version %s Landonet detected, attempting upgrade...', lando.versions.networking);
      const landonet = lando.engine.getNetwork(lando.config.networkBridge);
      // Remove the old network
      return landonet.inspect()
      .then(data => _.keys(data.Containers))
      .each(id => landonet.disconnect({Container: id, Force: true}))
      .then(() => landonet.remove())
      .catch(err => {
        lando.log.verbose('Error inspecting lando_bridge_network, probably does not exit yet');
        lando.log.debug(err);
      });
    }
  });

  // Make sure we have a lando bridge network
  // We do this here so we can take advantage of docker up assurancs in engine.js
  // and to make sure it covers all non-app services
  lando.events.on('pre-engine-start', 3, () => {
    // Let's get a list of network
    return lando.engine.getNetworks()
    // Try to find our net
    .then(networks => _.some(networks, network => network.Name === lando.config.networkBridge))
    // Create if needed and set our network version number
    .then(exists => {
      if (!exists) {
        return lando.engine.createNetwork(lando.config.networkBridge).then(() => {
          lando.cache.set('versions', _.merge({}, lando.versions, {networking: 2}), {persist: true});
          lando.versions = lando.cache.get('versions');
        });
      }
    });
  });

  // Return our default config
  return {
    config: {
      networkBridge: 'lando_bridge_network',
    },
  };
};
