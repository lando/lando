'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var merger = lando.utils.config.merge;
  var path = require('path');
  var utils = require('./lib/utils');

  // Meta
  var services = [
    'apache',
    'dotnet',
    'elasticsearch',
    'go',
    'nginx',
    'node',
    'mailhog',
    'mariadb',
    'memcached',
    'mssql',
    'mongo',
    'mysql',
    'postgres',
    'php',
    'phpmyadmin',
    'python',
    'redis',
    'ruby',
    'solr',
    'tomcat',
    'varnish'
  ];

  // Add some config for services
  lando.events.on('post-bootstrap', 1, function(lando) {

    // Log
    lando.log.info('Configuring services plugin');

    // Get some dirs
    var confDir = path.join(lando.config.userConfRoot, 'services', 'config');
    var helpDir = path.join(lando.config.userConfRoot, 'services', 'helpers');

    // Service defaults
    var defaultServiceConfig = {
      servicesConfigDir: confDir,
      servicesHelpersDir: helpDir,
      loadPassphraseProtectedKeys: false
    };

    // Merge config over defaults
    lando.config = lando.utils.config.merge(defaultServiceConfig, lando.config);

    // Add utilities
    lando.utils.services = require('./lib/utils');

    // Log it
    lando.log.verbose('Services plugin configured with %j', lando.config);

  });

  // Add services modules to lando
  lando.events.on('post-bootstrap', 2, function(lando) {

    // Log
    lando.log.info('Initializing services');

    // Add services to lando
    lando.services = require('./services')(lando);

    // Move our scripts over and set useful ENV we can use
    var helpersFrom = path.join(__dirname, 'helpers');
    var helpersTo = lando.config.servicesHelpersDir;
    lando.log.verbose('Copying config from %s to %s', helpersFrom, helpersTo);
    lando.utils.engine.moveConfig(helpersFrom, helpersTo);

  });

  // Load the services
  lando.events.on('post-bootstrap', function(lando) {
    _.forEach(services, function(service) {
      var serviceModule = './services/' + [service, service].join('/');
      lando.services.add(service, require(serviceModule)(lando));
    });
  });

  // Go through our services and log them
  lando.events.on('post-bootstrap', 9, function(lando) {
    _.forEach(lando.services.get(), function(service) {
      lando.log.verbose('Service %s loaded', service);
    });
  });

  // Make sure we have a lando bridge network
  // We do this here so we can take advantage of docker up assurancs in engine.js
  // and to make sure it covers all non-app services
  lando.events.on('pre-engine-start', function() {

    // Let's get a list of network
    return lando.engine.getNetworks()

    // Try to find our net
    .then(function(networks) {
      return _.some(networks, function(network) {
        return network.Name === lando.services.bridge;
      });
    })

    // Create if needed
    .then(function(exists) {
      if (!exists) {
        return lando.engine.createNetwork(lando.services.bridge);
      }
    });

  });

  // Let's also add in some config that we can pass down the stream
  lando.events.on('task-rebuild-run', function(options) {
    lando.events.on('post-instantiate-app', 9, function(app) {
      app.config._rebuildOnly = options.services || [];
    });
  });

  // This is where the meat of things happen
  lando.events.on('post-instantiate-app', 3, function(app) {

    // Check to see if we have any service definitions in our .lando.yml and parse
    // them into correct containers definition
    if (!_.isEmpty(app.config.services)) {
      _.forEach(app.config.services, function(service, name) {

        // Add some internal properties
        service._app = app.config.name;
        service._root = app.root;
        service._mount = app.mount;
        service._dockerName = app.dockerName;

        // Get our new containers
        var newCompose = lando.services.build(name, service.type, service);

        // Merge in the volumes and networks as well
        app.services = merger(app.services, newCompose.services);
        app.volumes = merger(app.volumes, newCompose.volumes);
        app.networks = merger(app.networks, newCompose.networks, merger);

      });

    }

  });

  // Do some other things
  lando.events.on('post-instantiate-app', function(app) {

    // Add in our app info
    app.events.on('post-info', function() {
      _.forEach(app.config.services, function(service, name) {

        // Load the main service
        var config = merger(app.services[name], service);
        var newInfo = lando.services.info(name, service.type, config);
        app.info[name] = merger(app.info[name], newInfo);

        // If this service has hidden info lets add that as well
        if (!_.isEmpty(service._hiddenInfo)) {
          _.forEach(service._hiddenInfo, function(hider) {
            var newInfo = lando.services.info(hider, hider, config);
            app.info[hider] = merger(app.info[hider], newInfo);
          });
        }

      });
    });

    // Remove build cache on an uninstall
    app.events.on('post-uninstall', function() {
      lando.cache.remove(app.name + ':last_build');
    });

    // Handle build steps
    // Go through each service and run additional build commands as needed
    app.events.on('post-start', function() {

      // Start up a build collector and set target build services
      var buildServices = app.config.services;

      // Check to see if we have to filter out build services
      // Currently this only exists so we can ensure lando rebuild's -s option
      // is respected re: build steps
      if (!_.isEmpty(_.get(app, 'config._rebuildOnly', []))) {
        var picker = _.get(app, 'config._rebuildOnly');
        buildServices = _.pick(buildServices, picker);
      }

      // Get the constructed build
      var build = _.map(utils.filterBuildSteps(buildServices), function(step) {

        // Discover the user
        var userPath = 'environment.LANDO_WEBROOT_USER';
        var user = _.get(app.services[step.name], userPath, 'root');

        // Map to a compose object
        return {
          id: step.container,
          cmd: step.cmd,
          compose: app.compose,
          project: app.name,
          opts: {
            app: app,
            mode: 'attach',
            user: (step.section === 'extras') ? 'root' : user,
            services: [step.container.split('_')[1]]
          }
        };

      });

      // Only proceed if build is non-empty
      if (!_.isEmpty(build)) {

        // Compute the build hash
        var newHash = lando.node.hasher(app.config.services);

        // If our new hash is different then lets build
        if (lando.cache.get(app.name + ':last_build') !== newHash) {
          lando.cache.set(app.name + ':last_build', newHash, {persist:true});
          return lando.engine.run(build);
        }

      }

    });

  });

};
