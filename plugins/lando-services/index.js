'use strict';

module.exports = lando => {};

/*
  @TODO: i do not think we need this anymore, see handling in reffreshcerts.sh
  // Let's also add in some config that we can pass down the stream
  lando.events.on('task-rebuild-run', options => {
    lando.events.on('post-instantiate-app', 9, app => {
      app.config._rebuildOnly = options.services || [];
    });
  });
*/

/*
  // Do some other things
  lando.events.on('post-instantiate-app', app => {
    // Build lockfiles
    const preLockfile = app.name + '.build.lock';
    const postLockfile = app.name + '.post-build.lock';

    // Add in our app info
    _.forEach(app.config.services, (service, name) => {
      // Load the main service
      const newService = _.cloneDeep(app.services[name]);
      const config = merger(newService, service);
      const newInfo = lando.services.info(name, service.type, config);
      app.info[name] = merger(app.info[name], newInfo);

      // If this service has hidden info lets add that as well
      if (!_.isEmpty(service._hiddenInfo)) {
        _.forEach(service._hiddenInfo, hider => {
          const newInfo = lando.services.info(hider, hider, config);
          app.info[hider] = merger(app.info[hider], newInfo);
        });
      }
    });

    // Get port data for portforward: true
    // @todo: this logic should probably be a testable and exportable unit
    app.events.on('post-info', () => {
      // Get our app cotnainers
      return lando.engine.list(app.name)

      // Filter our services with portforward: true set
      .filter(container => {
        if (_.has(app, 'config.services')) {
          if (!_.has(app.config.services[container.service], 'portforward')) {
            return false;
          } else {
            return app.config.services[container.service].portforward === true;
          }
        } else {
          return false;
        }
      })

      // Return running containers
      .filter(container => lando.engine.isRunning(container.id))

      // Inspect each and add new URLS
      .each(container => {
        return lando.engine.scan(container)
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
            const onHost = _.filter(_.get(data, netPath, []), item => {
              return item.HostIp === '0.0.0.0';
            });

            // Set the external port
            _.set(app.info[container.service], externalKey, onHost[0].HostPort);
          }
        });
      });
    });

    // Remove build locks on an uninstall
    app.events.on('post-uninstall', () => {
      lando.cache.remove(preLockfile);
      lando.cache.remove(postLockfile);
    });

    // Handle build steps
    // Go through each service and run additional build commands as needed
    app.events.on('app-ready', () => {
      // Start up a build collector and set target build services
      let buildServices = app.config.services;
      // Check to see if we have to filter out build services
      // Currently this only exists so we can ensure lando rebuild's -s option
      // is respected re: build steps
      if (!_.isEmpty(_.get(app, 'config._rebuildOnly', []))) {
        const picker = _.get(app, 'config._rebuildOnly');
        buildServices = _.pick(buildServices, picker);
      }

      // Pre app start build steps
      const preRootSteps = [
        'install_dependencies_as_root_internal',
        'install_dependencies_as_root',
      ];
      const preBuildSteps = [
        'install_dependencies_as_me_internal',
        'install_dependencies_as_me',
      ];
      const preBuild = utils.filterBuildSteps(buildServices, app, preRootSteps, preBuildSteps);

      // Post app start build steps
      const postRootSteps = [
        'run_as_root_internal',
        'run_as_root',
        'extras',
      ];
      const postBuildSteps = [
        'run_internal',
        'run_as_me_internal',
        'run',
        'run_as_me',
        'build',
      ];
      const postBuild = utils.filterBuildSteps(buildServices, app, postRootSteps, postBuildSteps);

      // Queue up both legacy and new build steps
      app.events.on('pre-start', () => utils.runBuild(lando, preBuild, preLockfile));
      app.events.on('post-start', () => utils.runBuild(lando, postBuild, postLockfile));
    });
  });
*/