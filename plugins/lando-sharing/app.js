'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const toObject = require('./../../lib/utils').toObject;
const mkdirp = require('mkdirp');
const semver = require('semver');
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

// Helper to determine whether we should use mutagen or not
const shouldMutagen = (dockerVersion = '0.0.0') => {
  // Only do this on non linux
  if (process.platform !== 'darwin') return false;
  // Otherwise return if we have sufficient docker version
  return semver.gte(dockerVersion, '2.3.30');
};

// Helper to get popuylation command
const getPopCommand = (excludes = []) => _.compact(_.flatten([['/helpers/mounter.sh'], excludes]));

module.exports = (app, lando) => {
  if (shouldExclude(_.get(app, 'config.excludes', []))) {
    // Get our excludes
    const excludes = getExcludes(app.config.excludes);
    const includes = getIncludes(app.config.excludes, true);

    // Sharing is caring
    app.events.on('post-init', () => {
      return lando.engine.getCompatibility().then(results => {
        // Get docker compat so we can see whether mutagen should be used
        const dockerDesktop = _.find(results, {name: 'desktop'});
        const mutagen = shouldMutagen(dockerDesktop.semversion);

        // If we dont have mutagen do the old thing
        if (!mutagen) {
          const serviceExcludes = utils.getServiceVolumes(excludes, '/app');
          const serviceIncludes = utils.getIncludeVolumes(includes, app.root);
          app.add(new app.ComposeService('excludes', {}, {
            volumes: utils.getNamedVolumes(excludes),
            services: toObject(app.services, {
              volumes: _.compact(serviceExcludes.concat(serviceIncludes)),
            }),
          }));

        // Otherwise just delegate or cache as needed
        } else {
          // Make sure all the exlcuded directories exist first
          _.forEach(excludes, exclude => mkdirp.sync(path.join(app.root, exclude)));

          // Build new excludes using include syntax, we skip excluded excludes because
          // mutagen actually syncs back to the host so there is no need to exclude an exclude
          const serviceExcludes = utils.getIncludeVolumes(excludes, app.root, 'delegated');
          app.add(new app.ComposeService('excludes', {}, {
            services: toObject(app.services, {
              volumes: _.compact(serviceExcludes),
            }),
          }));
        }
      });
    });

    // If we have no build lock and cant use mutagen lets make sure we (re)populate our volumes
    app.events.on('pre-start', 2, () => {
      if (!lando.cache.get(`${app.name}.build.lock`)) {
        return lando.engine.getCompatibility().then(results => {
          const dockerDesktop = _.find(results, {name: 'desktop'});
          const mutagen = shouldMutagen(dockerDesktop.semversion);

          // If we can use mutagen then we dont need to do this
          if (!mutagen) {
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
      }
    });
  }
};
