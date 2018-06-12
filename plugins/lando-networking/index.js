'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var path = require('path');

  // Define some things
  var caDir = 'certs';
  var usr = lando.config.userConfRoot;

  // Add some config for our networking
  lando.events.on('post-bootstrap', function(lando) {

    // Log
    lando.log.info('Configuring networking plugin');

    // Build the default config object
    var defaultNetworkingConfig = {
      caCertDir: path.join(usr, caDir),
      caCert: path.join(usr, caDir, 'lando.pem'),
      caService: path.join(usr, caDir, 'ca-setup.yml'),
      caProject: 'landocasetupkenobi38ahsoka' + lando.config.instance,
      networkBridge: 'lando_bridge_network'
    };

    // Merge defaults over the config, this allows users to set their own things
    lando.config = lando.utils.config.merge(defaultNetworkingConfig, lando.config);

    // Log it
    lando.log.verbose('Networking plugin configured with %j', lando.config);

    // Create the cert directory
    fs.mkdirpSync(lando.config.caCertDir);

    // Create a docker compose file to run ca creation
    var caService = {
      version: '3.2',
      services: {
        ca: {
          image: 'devwithlando/util:stable',
          environment: {
            LANDO_CA_CERT: path.basename(lando.config.caCert),
            LANDO_CONFIG_DIR: '$LANDO_ENGINE_CONF',
            LANDO_SERVICE_TYPE: 'ca',
            COLUMNS: 256,
            TERM: 'xterm'
          },
          command: ['tail', '-f', '/dev/null'],
          labels: {
            'io.lando.container': 'TRUE',
            'io.lando.service-container': 'TRUE',
          },
          volumes: [
            '$LANDO_ENGINE_SCRIPTS_DIR/setup-ca.sh:/setup-ca.sh',
            '$LANDO_ENGINE_CONF/certs:/certs',
          ]
        }
      }
    };

    // Log
    lando.log.debug('Creating ca-setup service %j', caService);
    lando.yaml.dump(lando.config.caService, caService);

    // Move our scripts over so we can use them elsewhere
    var scriptFrom = path.join(__dirname, 'scripts');
    var scriptTo = lando.config.engineScriptsDir;
    lando.log.verbose('Copying config from %s to %s', scriptFrom, scriptTo);
    lando.utils.engine.moveConfig(scriptFrom, scriptTo);

    // Ensure scripts are executable
    var scripts = ['add-cert.sh', 'setup-ca.sh'];
    _.forEach(scripts, function(script) {
      fs.chmodSync(path.join(lando.config.engineScriptsDir, script), '755');
    });

  });

  // Preemptively make sure we have enough networks and if we dont
  // smartly prune some of them
  lando.events.on('pre-engine-start', 1, function() {

    // Let's get a list of network
    return lando.engine.getNetworks()

    // If we are at the threshold lets engage some pruning ops
    .then(function(networks) {

      if (_.size(networks) >= 32) {

        // Warn user about this action
        lando.log.warn('Lando has detected you are at Docker\'s network limit!');
        lando.log.warn('Give us a moment as we try to make space by cleaning up old networks...');

        // List of default networks we can assume
        var landoNets = ['bridge', 'host', 'none', lando.config.networkBridge];

        // Add in proxyNet if we have if
        if (_.has(lando, 'config.proxyNet')) {
          landoNets.push(lando.config.proxyNet);
        }

        // Get list of app default networks
        return lando.app.list()

        // And add them to our default list
        .each(function(app) {
          landoNets.push(app.lando + '_default');
        })

        // Map some networks
        .then(function() {
          return networks;
        })

        // Filter out any landoy ones
        .filter(function(network) {
          return !_.includes(landoNets, network.Name);
        })

        // Inspect remaining networks to make sure we dont remove any
        // with attached containers
        .map(function(network) {
          return lando.engine.getNetwork(network.Id);
        })
        .map(function(network) {
          return network.inspect();
        })

        // Filter out any with containers
        .filter(function(network) {
          return _.isEmpty(network.Containers);
        })

        // Return the oldest 5 unused networks
        // @todo: what is the best assumption here?
        .then(function(networks) {
          return _.slice(_.orderBy(networks, 'Created', 'asc'), 0, 5);
        })

        // Get the Network object
        .map(function(network) {
          return lando.engine.getNetwork(network.Id);
        })

        // and remove it
        .each(function(net) {
          lando.log.warn('Removing old network %s', net.id);
          net.remove();
        });

      }

    });

  });

  // Make sure we have a lando bridge network
  // We do this here so we can take advantage of docker up assurancs in engine.js
  // and to make sure it covers all non-app services
  lando.events.on('pre-engine-start', 2, function() {

    // Let's get a list of network
    return lando.engine.getNetworks()

    // Try to find our net
    .then(function(networks) {
      return _.some(networks, function(network) {
        return network.Name === lando.config.networkBridge;
      });
    })

    // Create if needed
    .then(function(exists) {
      if (!exists) {
        return lando.engine.createNetwork(lando.config.networkBridge);
      }
    });

  });

  // Make sure we have a host-exposed root ca if we dont already
  // Also dont run this on the caProject otherwise infinite loop happens!
  lando.events.on('pre-engine-start', 2, function(data) {
    if (!fs.existsSync(lando.config.caCert) && data.project !== lando.config.caProject) {

      // Define the full CA service
      var ca = {
        id: [lando.config.caProject, 'ca', '1'].join('_'),
        compose: [lando.config.caService],
        project: lando.config.caProject,
        cmd: '/setup-ca.sh',
        opts: {
          mode: 'attach',
          services: ['ca']
        }
      };

      // Check if ca setup is already running
      return lando.engine.list()

      // Filter it out
      .filter(function(container) {
        return container.name === ca.id;
      })

      // Setup the CA
      .then(function(containers) {
        if (_.isEmpty(containers)) {

          // Start
          return lando.engine.start(ca)

          // Run CA setup
          .then(function() {
            return lando.engine.run(ca);
          })

          // Stop
          .then(function() {
            return lando.engine.stop(ca);
          })

          // Kill
          .then(function() {
            return lando.engine.destroy(ca);
          });

        }
      });

    }
  });

  // Add all the apps containers to the lando bridge network after the app starts
  // @NOTE: containers are automatically removed when the app stops
  lando.events.on('post-instantiate-app', 1, function(app) {
    app.events.on('post-start', 1, function() {

      // We assume the lando net exists at this point
      // @todo: is it safe to use a name vs an id here?
      var landonet = lando.engine.getNetwork(lando.config.networkBridge);

      // List all our app containers
      return lando.engine.list(app.name)

      // Go through each container
      .each(function(container) {

        // Set useful defaults
        var service = container.service;
        var aliases = [[service, container.app, 'internal'].join('.')];

        // Add in any additional aliases if we have proxy settings
        if (_.has(app, 'config.proxy.' + service)) {
          var proxies = _.get(app, 'config.proxy.' + service);
          if (!_.isNil(proxies) && _.isString(proxies[0])) {
            aliases = _.compact(aliases.concat(proxies));
          }
        }

        // Build out our options
        var opts = {Container: container.id, EndpointConfig: {Aliases: aliases}};

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

  // Add the hostname to the info
  lando.events.on('post-instantiate-app', function(app) {
    app.events.on('post-info', function() {
      _.forEach(app.info, function(data, name) {
        data.hostnames = _.get(data, 'hostnames', []);
        data.hostnames.push([name, app.name, 'internal'].join('.'));
      });
    });
  });

};
