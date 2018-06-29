'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

/*
 * Helper function to inject config
 */
exports.addConfig = (mount, volumes) => {
  // Filter the volumes by the host mount
  volumes = _.filter(volumes, volume => volume.split(':')[1] !== mount.split(':')[1]);
  // Push to volumes and then return
  volumes.push(mount);
  // Return the volume
  return volumes;
};

/*
 * Helper function to inject utility scripts
 */
exports.addScript = (script, volumes, here, there = 'scripts') => {
  // Construct the local path
  const localFile = path.join(here, script);
  const scriptFile = '/' + there + '/' + script;
  // Filter the volumes by the host mount
  volumes = _.filter(volumes, volume => volume.split(':')[1] !== scriptFile);
  // Make sure the script is executable
  fs.chmodSync(localFile, '755');
  // Push to volume
  volumes.push([localFile, scriptFile].join(':'));
  // Return the volumes
  return volumes;
};

/*
 * Helper to build a volumes
 * @NOTE: This seems weird, maybe written before we have more generic compose merging?
 * @NOTE: Once we have more testing can we switch this to use normalizePath?
 */
exports.buildVolume = (local, remote, base) => {
   // Figure out the deal with local
  if (_.isString(local)) {
    local = [local];
  }
  // Transform into path if needed
  local = local.join(path.sep);
  // Normalize the path with the base if it is not absolute
  const localFile = (path.isAbsolute(local)) ? local : path.join(base, local);
  // Return the volume
  return [localFile, remote].join(':');
};

/*
 * Return an object of build steps
 */
exports.filterBuildSteps = services => {
  // Start collecting them
  const build = [];
  // Go through each service
  _.forEach(services, (service, name) => {
    // Build steps
    const rootSteps = [
      'run_as_root_internal',
      'run_as_root',
      'extras',
    ];
    const buildSteps = [
      'run_internal',
      'run',
      'build',
    ];

    // Loop through all internal, legacy and user steps
    _.forEach(rootSteps.concat(buildSteps), section => {
      // If the service has build sections let's loop through and run some commands
      if (!_.isEmpty(service[section])) {
        // Normalize data for loopage
        if (!_.isArray(service[section])) {
          service[section] = [service[section]];
        }

        // Run each command
        _.forEach(service[section], cmd => {
          const container = [service._app, name, '1'].join('_');
          build.push({
            name: name,
            container: container,
            cmd: cmd,
            type: (_.includes(rootSteps, section)) ? 'root' : 'user',
          });
        });
      }
    });
  });
  // Return
  return build;
};


/*
 * Helper method to get the host part of a volume
 */
exports.getHostPath = mount => _.dropRight(mount.split(':')).join(':');

/*
 * Helper method to normalize a path so that Lando overrides can be used as though
 * the docker-compose files were in the app root.
 */
exports.normalizePath = (local, base, excludes = []) => {
  // Return local if it starts with $
  if (_.startsWith(local, '$')) return local;
  // Return local if it is one of the excludes
  if (_.includes(excludes, local)) return local;
  // Return local if local is an absolute path
  if (path.isAbsolute(local)) return local;
  // Otherwise this is a relaive path so return local resolved by base
  return path.resolve(path.join(base, local));
};

/*
 * Set the entrypoint with a local script
 */
exports.setEntrypoint = entrypoint => {
  // Define the entrypoint
  const file = path.basename(entrypoint);
  const remote = '/' + file;
  // Make sure the entrypoint is executable
  fs.chmodSync(entrypoint, '755');
  // Return the service fragment to merge in
  return {
    entrypoint: remote,
    volumes: [[entrypoint, remote].join(':')],
  };
};
