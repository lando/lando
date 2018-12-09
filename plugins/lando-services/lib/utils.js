'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * Filter and map build steps
 */
exports.filterBuildSteps = (services, app, rootSteps = [], buildSteps= []) => {
  // Start collecting them
  const build = [];
  // Go through each service
  _.forEach(services, (service, name) => {
    // Loop through all internal, legacy and user steps
    _.forEach(rootSteps.concat(buildSteps), section => {
      // If the service has build sections let's loop through and run some commands
      if (!_.isEmpty(service[section])) {
        // Normalize data for loopage
        if (!_.isArray(service[section])) service[section] = [service[section]];
        // Run each command
        _.forEach(service[section], cmd => {
          const container = [service._app, name, '1'].join('_');
          const user = _.get(app.services[name], 'environment.LANDO_WEBROOT_USER', 'www-data');
          build.push({
            id: container,
            cmd: cmd,
            compose: app.compose,
            project: app.name,
            opts: {
              pre: 'cd /app',
              app: app,
              mode: 'attach',
              user: (_.includes(rootSteps, section)) ? 'root' : user,
              services: [container.split('_')[1]],
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
    app: app.name,
    home: app._config.home,
    confDest: path.join(app._config.userConfRoot, 'config', service.type.split(':')[0]),
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
      lando.log.error('Looks like one of your build steps failed with %s', error);
      lando.log.warn('This **MAY** prevent your app from working');
      lando.log.warn('Check for errors above, fix them, and try again');
      lando.log.debug('Build error %s', error.stack);
    });
  }
};
