'use strict';

// Modules
const _ = require('lodash');

/*
 * @TODO
 */
module.exports = (app, lando) => {
  // Add all the apps containers to the lando bridge network with .internal aliases
  // for cross app networking
  app.events.on('post-start', 1, () => {
    // We assume the lando net exists at this point
    const landonet = lando.engine.getNetwork(lando.config.networkBridge);
    // List all our app containers
    return lando.engine.list({project: app.project})
    // Go through each container
    .map(container => {
      // Define the internal aliae
      const internalAlias = `${container.service}.${container.app}.internal`;
      // Sometimes you need to disconnect before you reconnect
      return landonet.disconnect({Container: container.id, Force: true})
      // Only throw non not connected errors
      .catch(error => {
        if (!_.includes(error.message, 'is not connected to network lando')) throw error;
      })
      // Connect
      .then(() => {
        landonet.connect({Container: container.id, EndpointConfig: {Aliases: [internalAlias]}});
        app.log.debug('connected %s to the landonet', container.name);
      });
    });
  });

  // Add proxy routes to the proxy as aliases. This should resolve a long
  // standing issue where thing.lndo.site behaves differently externally and
  // internally
  app.events.on('post-start', 1, () => {
    if (lando.config.proxy === 'ON') {
      // Get the needed ids
      const proxyNet = lando.engine.getNetwork(lando.config.proxyNet);
      const proxyContainer = lando.config.proxyContainer;

      // Inspect the proxy container
      return lando.engine.scan({id: proxyContainer}).then(data => {
        // Get existing aliases and merge them into our new ones
        // @NOTE: Do we need to handle wildcards and paths?
        const aliasPath = `NetworkSettings.Networks.${lando.config.proxyNet}.Aliases`;
        const aliases = _(_.get(app, 'config.proxy', []))
          .map(route => route)
          .flatten()
          .map(entry => _.isString(entry) ? entry : entry.hostname)
          .map(entry => _.first(entry.split(':')))
          .compact()
          .thru(routes => routes.concat(_.get(data, aliasPath, [])))
          .uniq()
          .value();

        // Disconnect so we can reconnect
        return proxyNet.disconnect({Container: proxyContainer, Force: true})
          // Only throw non not connected errors
          .catch(error => {
            if (!_.includes(error.message, 'is not connected to network lando')) throw error;
          })
          // Connect
          .then(() => {
            proxyNet.connect({Container: proxyContainer, EndpointConfig: {Aliases: aliases}});
            app.log.debug('aliased %j to the proxynet', aliases);
          });
      });
    }
  });

  // Add in the hostname infos
  app.events.on('post-init', 1, () => {
    app.log.debug('adding hostnames to the app...');
    _.forEach(app.info, data => {
      data.hostnames = _.get(data, 'hostnames', []);
      data.hostnames.push([data.service, app.project, 'internal'].join('.'));
      app.log.debug('hostnames added to %s', data.service, data.hostnames);
    });
  });
};
