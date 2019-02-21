'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const utils = require('./lib/utils');

// Helper to make excludes unique
// @TODO: make sure exclude exists on host
const parseExcludes = (excludes = []) => _(excludes).uniq().compact().value();

// Helper to determine whether we should exclude
const shouldExclude = (excludes = []) => {
  // Only do this on non linux
  if (process.platform === 'linux') return false;
  // Otherwise return if we have non-empty config
  return !_.isEmpty(parseExcludes(excludes));
};

// Helper to get popuylation command
const getPopCommand = (excludes = []) => _.compact(_.flatten([['/helpers/mounter.sh'], excludes]));

module.exports = (app, lando) => {
  if (shouldExclude(_.get(app, 'config.excludes', []))) {
    // Get our excludes
    const excludes = parseExcludes(app.config.excludes);

    // If we have no build lock lets make sure we (re)populate our volumes
    app.events.on('pre-start', 2, () => {
      if (!lando.cache.get(`${app.name}.build.lock`)) {
        const LandoMounter = lando.factory.get('_mounter');
        const mountData = new LandoMounter(lando.config.userConfRoot, app.root, excludes);
        const mountDir = path.join(lando.config.userConfRoot, 'mounter', app.name);
        const mountFiles = lando.utils.dumpComposeData(mountData, mountDir);
        return lando.engine.run({
          compose: _.flatten([app.compose, mountFiles]),
          project: app.project,
          cmd: getPopCommand(excludes),
          opts: {
            mode: 'attach',
            services: ['mounter'],
            autoRemove: true,
            workdir: '/source',
          },
        });
      }
    });

    // Sharing is caring
    app.events.on('post-init', () => {
      // Add the top level volumes
      app.add(new app.ComposeService('excludes-volumes', {}, {
        volumes: utils.getNamedVolumes(excludes),
      }));
      // Drill down into each service and modify the volumes
      // @NOTE: for some reason this is necessary and we cant do the same thing
      // we are doing above, seems like the nested /app volumes need to be declared in teh same place
      // and early on
      /*
      _.forEach(app.composeData, service => {
        if (_.includes(app.services, service.id) && _.has(service.data[0], `services.${service.id}.volumes`)) {
          // Re-add the host mounted /app
          service.data[0].services[service.id].volumes.push(`${app.root}:/app:delegated`);
          // Add the named volumes
          _.forEach(utils.getServiceVolumes(excludes, '/app'), volume => {
            service.data[0].services[service.id].volumes.push(volume);
          });
        }
      })
      */
    });
  }
};
