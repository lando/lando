'use strict';

// Modules
const _ = require('lodash');
const utils = require('./lib/utils');

// Build keys
const preRootSteps = [
  'build_as_root_internal',
  'build_as_root',
  'install_dependencies_as_root_internal',
  'install_dependencies_as_root',
];
const preBuildSteps = [
  'build_internal',
  'build',
  'install_dependencies_as_me_internal',
  'install_dependencies_as_me',
];
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
];

/*
 * @TODO
 */
module.exports = (app, lando) => {
  // Build step locl files
  const preLockfile = app.name + '.build.lock';
  const postLockfile = app.name + '.post-build.lock';

  // Init this early on but not before our recipes
  app.events.on('pre-init', () => {
    // @TODO sexier _() implementation?
    const services = utils.parseConfig(_.get(app, 'config.services', {}), app);
    _.forEach(services, service => {
      // Throw a warning if service is not supported
      if (_.isEmpty(_.find(lando.factory.get(), {name: service.type}))) {
        lando.log.warn('%s is not a supported service type.', service.type);
      }
      // Log da things
      lando.log.verbose('Building %s %s named %s', service.type, service.version, service.name);
      // Build da things
      // @NOTE: this also gathers app.info and build steps
      const Service = lando.factory.get(service.type);
      const data = new Service(service.name, service, lando.factory);
      app.add(data);
      // console.log(data.info);
      app.info.push(data.info);
    });
  });

  // Handle build steps
  // Go through each service and run additional build commands as needed
  app.events.on('post-init', () => {
    const buildServices = _.get(app, 'opts.services', app.services);
    // Queue up both legacy and new build steps
    app.events.on('pre-start', 100, () => {
      const preBuild = utils.filterBuildSteps(buildServices, app, preRootSteps, preBuildSteps);
      return utils.runBuild(lando, preBuild, preLockfile);
    });
    app.events.on('post-start', 100, () => {
      const postBuild = utils.filterBuildSteps(buildServices, app, postRootSteps, postBuildSteps);
      return utils.runBuild(lando, postBuild, postLockfile);
    });
  });

  // Discover portforward true info
  app.events.on('post-init', () => {
    const forwarders = _.filter(app.info, service => _.get(service, 'external_connection.port', false));
    return lando.engine.list({app: app.project})
    .filter(service => _.includes(_.flatMap(forwarders, service => service.service), service.service))
    .map(service => ({
      id: service.id,
      service: service.service,
      internal: _.get(_.find(app.info, {service: service.service}), 'internal_connection.port'),
    }))
    .map(service => lando.engine.scan(service).then(data => {
      const key = `NetworkSettings.Ports.${service.internal}/tcp`;
      const port = _.filter(_.get(data, key, []), forward => forward.HostIp === '0.0.0.0');
      if (_.has(port[0], 'HostPort')) {
        _.set(_.find(app.info, {service: service.service}), 'external_connection.port', port[0].HostPort);
      }
    }));
  });

  // Remove build locks on an uninstall
  app.events.on('post-uninstall', () => {
    lando.cache.remove(preLockfile);
    lando.cache.remove(postLockfile);
  });
};
