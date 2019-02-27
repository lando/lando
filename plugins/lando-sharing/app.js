'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const toObject = require('./../../lib/utils').toObject;
const utils = require('./lib/utils');

// @TODO: make sure exclude exists on host
// @TODO: make sure container is destroyed on sync fails

// Helper to make excludes unique
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
            workdir: '/source',
          },
        });
      }
    });

    // Sharing is caring
    app.events.on('post-init', () => {
      app.add(new app.ComposeService('excludes', {}, {
        volumes: utils.getNamedVolumes(excludes),
        services: toObject(app.services, {
          volumes: utils.getServiceVolumes(excludes, '/app'),
        }),
      }));
    });
  }
};
