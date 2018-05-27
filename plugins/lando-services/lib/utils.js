'use strict';

// Modules
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');

/**
 * Return an object of build steps
 *
 * @since 3.0.0
 * @alias 'lando.utils.services.filterBuildSteps'
 */
exports.filterBuildSteps = function(services) {

  // Start collecting them
  var build = [];

  // Go through each service
  _.forEach(services, function(service, name) {

    // Build steps
    var rootSteps = [
      'run_as_root_internal',
      'run_as_root',
      'extras',
    ];
    var buildSteps = [
      'run_internal',
      'run',
      'build'
    ];

    // Loop through all internal, legacy and user steps
    _.forEach(rootSteps.concat(buildSteps), function(section) {

      // If the service has build sections let's loop through and run some commands
      if (!_.isEmpty(service[section])) {

        // Normalize data for loopage
        if (!_.isArray(service[section])) {
          service[section] = [service[section]];
        }

        // Run each command
        _.forEach(service[section], function(cmd) {
          var container = [service._app, name, '1'].join('_');
          build.push({
            name: name,
            container: container,
            cmd: cmd,
            type: (_.includes(rootSteps, section)) ? 'root' : 'user'
          });
        });

      }

    });

  });

  // Return
  return build;

};

/**
 * Set the entrypoint with a local script
 *
 * @since 3.0.0
 * @alias 'lando.utils.services.setEntrypoint'
 */
exports.setEntrypoint = function(entrypoint) {

  // Define the entrypoint
  var file = path.basename(entrypoint);
  var remote = '/' + file;

  // Make sure the entrypoint is executable
  fs.chmodSync(entrypoint, '755');

  // Return the service fragment to merge in
  return {
    entrypoint: remote,
    volumes: [[entrypoint, remote].join(':')]
  };

};

/**
 * Helper to normalize a path
 *
 * @since 3.0.0
 * @alias 'lando.utils.services.normalizePath'
 */
exports.normalizePath = function(local, base) {
  var normalize = !path.isAbsolute(local) && !_.startsWith(local, '$');
  return normalize ? path.resolve(base, local) : local;
};

/**
 * Helper to build a volumes
 * @NOTE: This seems weird, maybe written before we have more generic compose merging?
 * @NOTE: Once we have more testing can we switch this to use normalizePath?
 *
 * @since 3.0.0
 * @alias 'lando.utils.services.buildVolume'
 */
exports.buildVolume = function(local, remote, base) {

   // Figure out the deal with local
  if (_.isString(local)) {
    local = [local];
  }

  // Transform into path if needed
  local = local.join(path.sep);

  // Normalize the path with the base if it is not absolute
  var localFile = (path.isAbsolute(local)) ? local : path.join(base, local);

  // Return the volume
  return [localFile, remote].join(':');

};

/**
 * Helper function to inject config
 *
 * @since 3.0.0
 * @alias 'lando.utils.services.addConfig'
 */
exports.addConfig = function(mount, volumes) {

  // Filter the volumes by the host mount
  volumes = _.filter(volumes, function(volume) {
    return volume.split(':')[1] !== mount.split(':')[1];
  });

  // Push to volumes and then return
  volumes.push(mount);

  // Return the volume
  return volumes;

};

/**
 * Helper function to inject utility scripts
 *
 * @since 3.0.0
 * @alias 'lando.utils.services.addScript'
 */
exports.addScript = function(script, volumes, here, there) {

  // Set the base
  var local = here;
  var remote = there || 'scripts';

  // Construct the local path
  var localFile = path.join(local, script);
  var scriptFile = '/' + remote + '/' + script;

  // Filter the volumes by the host mount
  volumes = _.filter(volumes, function(volume) {
    return volume.split(':')[1] !== scriptFile;
  });

  // Make sure the script is executable
  fs.chmodSync(localFile, '755');

  // Push to volume
  volumes.push([localFile, scriptFile].join(':'));

  // Return the volumes
  return volumes;

};
