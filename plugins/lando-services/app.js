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
      lando.log.debug('Building %s with config %j', service.name, service);
      // Build da things
      // @NOTE: this also gathers app.info and build steps
      const Service = lando.factory.get(service.type);
      app.add(new Service(service.name, service, lando.factory));
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

  // Remove build locks on an uninstall
  app.events.on('post-uninstall', () => {
    lando.cache.remove(preLockfile);
    lando.cache.remove(postLockfile);
  });
};
