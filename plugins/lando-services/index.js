'use strict';

module.exports = lando => {

  // Modules
  const _ = lando.node._;
  const merger = lando.utils.config.merge;
  const path = require('path');
  const utils = require('./lib/utils');

  // Meta
  const services = [
    'apache',
    'blackfire',
    'compose',
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
  lando.events.on('post-bootstrap', 1, lando => {

    // Log
    lando.log.info('Configuring services plugin');

    // Get some dirs
    const confDir = path.join(lando.config.userConfRoot, 'services', 'config');
    const helpDir = path.join(lando.config.userConfRoot, 'services', 'helpers');

    // Service defaults
    const defaultServiceConfig = {
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
  lando.events.on('post-bootstrap', 2, lando => {

    // Log
    lando.log.info('Initializing services');

    // Add services to lando
    lando.services = require('./services')(lando);

    // Move our scripts over and set useful ENV we can use
    const helpersFrom = path.join(__dirname, 'helpers');
    const helpersTo = lando.config.servicesHelpersDir;
    lando.log.verbose('Copying config from %s to %s', helpersFrom, helpersTo);
    lando.utils.engine.moveConfig(helpersFrom, helpersTo);

  });

  // Load the services
  lando.events.on('post-bootstrap', lando => {
    _.forEach(services, service => {
      const serviceModule = './services/' + [service, service].join('/');
      lando.services.add(service, require(serviceModule)(lando));
    });
  });

  // Go through our services and log them
  lando.events.on('post-bootstrap', 9, lando => {
    _.forEach(lando.services.get(), service => {
      lando.log.verbose('Service %s loaded', service);
    });
  });

  // Let's also add in some config that we can pass down the stream
  lando.events.on('task-rebuild-run', options => {
    lando.events.on('post-instantiate-app', 9, app => {
      app.config._rebuildOnly = options.services || [];
    });
  });

  // This is where the meat of things happen
  lando.events.on('post-instantiate-app', 3, app => {

    // Check to see if we have any service definitions in our .lando.yml and parse
    // them into correct containers definition
    if (!_.isEmpty(app.config.services)) {
      _.forEach(app.config.services, (service, name) => {

        // Add some internal properties
        service._app = app.name;
        service._root = app.root;
        service._mount = app.mount;

        // Get our new containers
        const newCompose = lando.services.build(name, service.type, service);

        // Merge in the volumes and networks as well
        app.services = merger(app.services, newCompose.services);
        app.volumes = merger(app.volumes, newCompose.volumes);
        app.networks = merger(app.networks, newCompose.networks, merger);

      });

    }

  });

  // Do some other things
  lando.events.on('post-instantiate-app', app => {

    // Add in our app info
    _.forEach(app.config.services, function(service, name) {

      // Load the main service
      var newService = _.cloneDeep(app.services[name]);
      var config = merger(newService, service);
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

    // Get port data for portforward: true
    // @todo: this logic should probably be a testable and exportable unit
    // Get our app cotnainers
    app.events.on('post-info', () => lando.engine.list(app.name)

    // Filter our services with portforward: true set
    .filter(container => {
      if (_.has(app, 'config.services')) {
        if (!_.has(app.config.services[container.service], 'portforward')) {
          return false;
        }
        else {
          return app.config.services[container.service].portforward === true;
        }
      }
      else {
        return false;
      }
    })

    // Return running containers
    .filter(container => lando.engine.isRunning(container.id))

    // Inspect each and add new URLS
    .each(container => lando.engine.scan(container)
    .then(data => {

      // Get the internal port so we can discover the forwarded one
      const internalKey = 'internal_connection.port';
      const externalKey = 'external_connection.port';
      const port = _.get(app.info[container.service], internalKey);

      // If we actaully have a port lets continue
      if (port) {

        // Get the netpath
        const netPath = 'NetworkSettings.Ports.' + port + '/tcp';

        // Filter out only ports that are exposed to 0.0.0.0
        const onHost = _.filter(_.get(data, netPath, []), item => item.HostIp === '0.0.0.0');

        // Set the external port
        _.set(app.info[container.service], externalKey, onHost[0].HostPort);

      }

    })));

    // Remove build cache on an uninstall
    app.events.on('post-uninstall', function() {
      lando.cache.remove(app.name + '.last_build');
    });

    // Add some logic that extends start until healthchecked containers report as healthy
    // Get this apps containers
    app.events.on('post-start', 1, () => lando.engine.list(app.name)

    // Wait until containers are ready
    .map(container => lando.services.healthcheck(container))

    // Analyze and warn if needed
    .then(data => {

      // Per service warnings
      _.each(data, datum => {
        if (datum.health === 'unhealthy') {
          lando.log.warn('Service %s is unhealthy', datum.service);
          lando.log.warn('Run "lando logs -s %s"', datum.service);
        }
      });

      // Log the whole thing
      lando.log.verbose('Healthcheck for %s = %j', app.name, data);

    }));

    // Handle build steps
    // Go through each service and run additional build commands as needed
    app.events.on('post-start', () => {

      // Start up a build collector and set target build services
      let buildServices = app.config.services;

      // Check to see if we have to filter out build services
      // Currently this only exists so we can ensure lando rebuild's -s option
      // is respected re: build steps
      if (!_.isEmpty(_.get(app, 'config._rebuildOnly', []))) {
        const picker = _.get(app, 'config._rebuildOnly');
        buildServices = _.pick(buildServices, picker);
      }

      // Get the constructed build
      const build = _.map(utils.filterBuildSteps(buildServices), step => {

        // Discover the user
        const userPath = 'environment.LANDO_WEBROOT_USER';
        const user = _.get(app.services[step.name], userPath, 'root');

        // Map to a compose object
        return {
          id: step.container,
          cmd: step.cmd,
          compose: app.compose,
          project: app.name,
          opts: {
            app: app,
            mode: 'attach',
            user: (step.type === 'root') ? 'root' : user,
            services: [step.container.split('_')[1]]
          }
        };

      });

      // Only proceed if build is non-empty
      if (!_.isEmpty(build)) {

        // Compute the build hash
        const newHash = lando.node.hasher(app.config);

        // If our new hash is different then lets build
        if (lando.cache.get(app.name + '.last_build') !== newHash) {

          // Run the stuff
          return lando.engine.run(build)

          // Save the new hash if everything works out ok
          .then(function() {
            lando.cache.set(app.name + '.last_build', newHash, {persist:true});
          })

          // Make sure we don't save a hash if our build fails
          .catch(error => {
            lando.log.error('Looks like one of your build steps failed...');
            lando.log.warn('This **MAY** prevent your app from working');
            lando.log.warn('Check for errors above, fix them, and try again');
            lando.log.verbose('Error %j', error);
          });

        }

      }

    });

  });

  // Collect info so we can inject LANDO_INFO
  //
  // @TODO: this is not currently the full lando info because a lot of it requires
  // the app to be on
  lando.events.on('post-instantiate-app', 8, function(app) {
    app.env.LANDO_INFO = JSON.stringify(app.info);
  });

};
