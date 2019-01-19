'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * Helper to get global deps
 * @TODO: this looks pretty testable? should services have libs?
 */
exports.addBuildStep = (steps, app, name, step = 'build_internal', front = false) => {
  const current = _.get(app, `config.services.${name}.${step}`, []);
  const add = (front) ? _.flatten([steps, current]) : _.flatten([current, steps]);
  _.set(app, `config.services.${name}.${step}`, add);
};

/*
 * Helper to get global deps
 * @TODO: this looks pretty testable? should services have libs?
 */
exports.getInstallCommands = (deps, pkger, prefix = []) => _(deps)
  .map((version, pkg) => _.flatten([prefix, pkger(pkg, version)]))
  .map(command => command.join(' '))
  .value();

/*
 * Filter and map build steps
 */
exports.filterBuildSteps = (services, app, rootSteps = [], buildSteps= []) => {
  // Start collecting them
  const build = [];
  // Go through each service
  _.forEach(services, service => {
    // Loop through all internal, legacy and user steps
    _.forEach(rootSteps.concat(buildSteps), section => {
      // If the service has build sections let's loop through and run some commands
      if (!_.isEmpty(_.get(app, `config.services.${service}.${section}`, []))) {
        // Run each command
        _.forEach(app.config.services[service][section], cmd => {
          const container = `${app.project}_${service}_1`;
          build.push({
            id: container,
            cmd: cmd,
            compose: app.compose,
            project: app.project,
            opts: {
              mode: 'attach',
              user: (_.includes(rootSteps, section)) ? 'root' : 'www-data',
              services: [service],
            },
          });
        });
      }
    });
  });
  // Return
  return build;
};

/*
 * Parse config into raw materials for our factory
 */
exports.parseConfig = (config, app) => _(config)
  .map((service, name) => _.merge({}, service, {name}))
  .map(service => _.merge({}, service, {
    _app: app,
    app: app.name,
    confDest: path.join(app._config.userConfRoot, 'config', service.type.split(':')[0]),
    home: app._config.home,
    project: app.project,
    type: service.type.split(':')[0],
    root: app.root,
    userConfRoot: app._config.userConfRoot,
    version: service.type.split(':')[1],
  }))
  .value();

/*
 * Run build
 */
exports.runBuild = (lando, steps, lockfile) => {
  if (!_.isEmpty(steps) && !lando.cache.get(lockfile)) {
    return lando.engine.run(steps)
    // Save the new hash if everything works out ok
    .then(() => {
      lando.cache.set(lockfile, 'YOU SHALL NOT PASS', {persist: true});
    })
    // Make sure we don't save a hash if our build fails
    .catch(error => {
      lando.log.error('Looks like one of your build steps failed! with %s', error.stack);
      lando.log.warn('This **MAY** prevent your app from working');
      lando.log.warn('Check for errors above, fix them, and try again');
      lando.log.debug('Build error %j', error);
    });
  }
};
