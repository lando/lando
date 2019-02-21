'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const toObject = require('./../../lib/utils').toObject;
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
          compose: mountFiles,
          project: app.project,
          cmd: getPopCommand(excludes),
          opts: {
            mode: 'attach',
            services: ['mounter'],
            autoRemove: true,
            workdir: '/app',
          },
        });
      }
    });

    // Add populated volumes to our app
    app.events.on('post-init', 9, () => {
      // Add our named volumes to the beginning
      app.add(new app.ComposeService('excludes-named-volumes', {}, {volumes: utils.getNamedVolumes(excludes)}), true);
      // And our service volumes to the end
      const volumes = utils.getServiceVolumes(excludes, '/app');
      app.add(new app.ComposeService('excludes-volumes', {}, {services: toObject(app.services, {volumes})}));
    });
  }
};
