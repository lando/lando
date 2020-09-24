'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const toObject = require('./../../lib/utils').toObject;
const utils = require('./lib/utils');

// Helper to get excludes
const getExcludes = (data = [], inverse = false) => _(data)
  .filter(exclude => _.startsWith(exclude, '!') === inverse)
  .map(exclude => _.trimStart(exclude, '!'))
  .uniq()
  .compact()
  .value();

// Helper to get includes
const getIncludes = data => getExcludes(data, true);

// Helper to determine whether we should exclude
const shouldExclude = (excludes = []) => {
  // Only do this on non linux
  if (process.platform === 'linux') return false;
  // Otherwise return if we have non-empty config
  return !_.isEmpty(getExcludes(excludes));
};

// Helper to get popuylation command
const getPopCommand = (excludes = []) => _.compact(_.flatten([['/helpers/mounter.sh'], excludes]));

module.exports = (app, lando) => {
  if (shouldExclude(_.get(app, 'config.excludes', []))) {
    // Get our excludes
    const excludes = getExcludes(app.config.excludes);
    const includes = getIncludes(app.config.excludes, true);

    // If we have no build lock and cant use mutagen lets make sure we (re)populate our volumes
    app.events.on('pre-start', 2, () => {
      if (!lando.cache.get(`${app.name}.build.lock`)) {
        const LandoMounter = lando.factory.get('_mounter');
        const mountData = new LandoMounter(lando.config, app.root, excludes);
        const mountDir = path.join(lando.config.userConfRoot, 'mounter', app.name);
        const mountFiles = lando.utils.dumpComposeData(mountData, mountDir);
        const run = {
          compose: mountFiles,
          project: app.project,
          cmd: getPopCommand(excludes),
          opts: {
            mode: 'attach',
            services: ['mounter'],
            autoRemove: true,
            workdir: '/source',
          },
        };
        return lando.engine.run(run)
        // Destroy on fail
        .catch(err => {
          run.opts = {purge: true, mode: 'attach'};
          return lando.engine.stop(run).then(() => lando.engine.destroy(run)).then(() => lando.Promise.reject(err));
        });
      }
    });

    // Sharing is caring
    app.events.on('post-init', () => {
      const serviceExcludes = utils.getServiceVolumes(excludes, '/app');
      const serviceIncludes = utils.getIncludeVolumes(includes, app.root);
      app.add(new app.ComposeService('excludes', {}, {
        volumes: utils.getNamedVolumes(excludes),
        services: toObject(app.services, {
          volumes: _.compact(serviceExcludes.concat(serviceIncludes)),
        }),
      }));
    });
  }
};
