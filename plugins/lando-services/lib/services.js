/**
 * This provides a way to load services
 *
 * @name services
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var merger = lando.utils.merger;
  var path = require('path');

  /*
   * Helper to merge overrides
   *
   * @todo: this is currently incomplete and only merges in the big things
   * like volumes and environment. All other keys should be regarded skeptically
   */
  var mergeOver = function(service, overrides) {

    // Handle volumes specially
    var oldVols = service.volumes || [];
    var newVols = _.flatten([oldVols, overrides.volumes]);

    // Merge in everythign else
    service = _.mergeWith(service, overrides, merger);

    // Reset the volume and remove any null values which might get added
    // if we are using a custom image
    service.volumes = _.compact(_.uniq(newVols));

    // Return the new service
    return service;

  };

  /*
   * Helper to move conf into a mountable dir
   */
  var moveConfig = function(service, dir) {

    // Copy opts and filter out all js files
    // We dont want to give the false impression that you can edit the JS
    var copyOpts = {
      overwrite: true,
      filter: function(file) {
        return (path.extname(file) !== '.js');
      }
    };

    // Ensure userconf root exists
    var ucr = lando.config.userConfRoot;
    var newDir = path.join(ucr, 'services', 'config', service);
    fs.mkdirpSync(newDir);

    // Log
    lando.log.verbose('Copying %s config from %s to %s', service, dir, newDir);

    // Try to copy the assets over
    try {
      fs.copySync(dir, newDir, copyOpts);
    }

    // If we have an EPERM, try to remove the file/directory and then retry
    catch (error) {

      // Parse the error for dataz
      var code = _.get(error, 'code');
      var syscall = _.get(error, 'syscall');
      var f = _.get(error, 'path');

      // If we dont have the dataz we need to actually error
      if (code !== 'EISDIR' || syscall !== 'open' || !!fs.ensureDirSync(f)) {
        lando.log.error(error);
        process.exit(542);
      }

      // Log
      lando.log.warn('Detected a bad situation moving %s config...', service);
      lando.log.warn('Trying to fix it');

      // Try to take corrective action
      fs.removeSync(f);

      // Try to move again
      fs.copySync(dir, newDir, copyOpts);

    }

    // Return the new scripts directory
    return newDir;

  };

  /*
   * Set the global docker entrypoint
   */
  var setEntrypoint = function(service) {

    // Define the entrypoint
    var entrypoint = 'lando-entrypoint.sh';

    // Make sure the entrypoint is executable
    fs.chmodSync(path.join(lando.config.engineScriptsDir, entrypoint), '755');

    // Entrypoint files
    var host = path.join('$LANDO_ENGINE_SCRIPTS_DIR', entrypoint);
    var container = '/lando-entrypoint.sh';

    // Volumes
    var volumes = service.volumes || [];
    volumes.push([host, container].join(':'));

    // Add our things to the container
    service.entrypoint = container;
    service.volumes = volumes;

    // Return the service
    return service;

  };

  // Set an envvar for our config directory
  var confDir = path.join(lando.config.userConfRoot, 'services', 'config');
  lando.config.engineConfigDir = confDir;
  lando.config.env.LANDO_ENGINE_CONFIG_DIR = confDir;

  // Move our scripts over and set useful ENV we can use
  var scriptsDir = path.join(__dirname, '..', 'scripts');
  scriptsDir = moveConfig('scripts', scriptsDir);
  lando.config.engineScriptsDir = scriptsDir;
  lando.config.env.LANDO_ENGINE_SCRIPTS_DIR = scriptsDir;

  // Set an envvar for our helpers directory
  var helpersDir = path.join(__dirname, '..', 'helpers');
  helpersDir = moveConfig('helpers', helpersDir);
  lando.config.engineHelpersDir = helpersDir;
  lando.config.env.LANDO_ENGINE_HELPERS_DIR = helpersDir;

  // Registry of services
  var registry = {};

  /*
   * Get all services
   */
  var get = function() {
    return _.keys(registry);
  };

  /*
   * Add a service to the registry
   */
  var add = function(name, module) {
    registry[name] = module;
  };

  /**
   * Helper function to inject config
   */
  var buildVolume = function(local, remote, base) {

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
   */
  var addConfig = function(mount, volumes) {

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
   */
  var addThing = function(script, volumes, here, there) {

    // Set the base
    var local = here || lando.config.engineScriptsDir;
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

    // Log
    lando.log.verbose('Injecting %s from %s to %s', script, here, there);

    // Return the volumes
    return volumes;

  };

  /**
   * Helper function to inject utility scripts
   */
  var addHelper = function(script, volumes) {
    return addThing(script, volumes, lando.config.engineHelpersDir, 'helpers');
  };

  /**
   * Helper function to inject pre-run scripts
   */
  var addScript = function(script, volumes) {
    return addThing(script, volumes, lando.config.engineScriptsDir, 'scripts');
  };

  /**
   * Delegator to gather info about a service for display to the user
   */
  var info = function(name, type, config) {

    // Parse the type and version
    var service = type.split(':')[0];
    var version = type.split(':')[1] || 'latest';

    // Check to verify whether the service exists in the registry
    if (!registry[service]) {
      lando.log.warn('%s is not a supported service.', service);
      return {};
    }

    // Start an info collector
    var info = {};

    // Add basic info about our service
    info.type = service;
    info.version = version;

    // Get additional information
    info = _.mergeWith(info, registry[service].info(name, config), merger);

    // Log
    lando.log.verbose('Info get for %s:%s named %s', service, version, name);

    // Return info
    return info;

  };

  /**
   * The core service builder
   */
  var build = function(name, type, config) {

    // Parse the type
    var service = type.split(':')[0];

    // Add a version from the tag if available
    config.version = type.split(':')[1] || 'latest';

    // Check to verify whether the service exists in the registry
    if (!registry[service]) {
      lando.log.warn('%s is not a supported service.', service);
      return {};
    }

    // Log
    lando.log.verbose('Building %s %s ad %s', service, config.version, name);
    lando.log.debug('Building %s with config', name, config);

    // If this version is not supported through a warning and return
    if (!_.includes(registry[service].versions, config.version)) {
      lando.log.warn('%s version %s not supported.', service, config.version);
      return {};
    }

    // Move our config into the userconfroot if we have some
    // NOTE: we need to do this because on macOS and Windows not all host files
    // are shared into the docker vm
    if (_.has(registry[service], 'configDir')) {
      moveConfig(service, registry[service].configDir);
    }

    // Get the networks, services and volumes
    var networks = registry[service].networks(name, config);
    var services = registry[service].services(name, config);
    var volumes = registry[service].volumes(name, config);

    // Add in the our global docker entrypoint
    // NOTE: this can be overridden down the stream
    services[name] = setEntrypoint(services[name]);
    lando.log.debug('Setting default entrypoint for %s', name);

    // Add in some helpful ENVs
    var env = services[name].environment || {};
    env.LANDO_SERVICE_NAME = name;
    env.LANDO_SERVICE_TYPE = service;
    env.LANDO_MOUNT = config._mount;
    services[name].environment = env;

    // Add in some helpful volumes
    var vols = services[name].volumes || [];
    var shareMode = (process.platform === 'darwin') ? ':delegated' : '';
    vols.push('$LANDO_APP_ROOT_BIND:/app' + shareMode);
    vols.push('$LANDO_ENGINE_HOME:/user' + shareMode);
    vols.push('$LANDO_ENGINE_SCRIPTS_DIR/user-perms.sh:/user-perms.sh');
    services[name].volumes = _.uniq(vols);

    // Add SSH key loading to every container
    services[name].volumes = addScript('load-keys.sh', services[name].volumes);

    // Add generic helper scripts to every contaniner
    var helpers = ['mysql-import.sh', 'mysql-export.sh'];
    _.forEach(helpers, function(helper) {
      services[name].volumes = addHelper(helper, services[name].volumes);
    });

    // Add in any custom pre-runscripts
    if (!_.isEmpty(config.scripts)) {
      _.forEach(config.scripts, function(script) {
        var r = path.join('/scripts', path.basename(script));
        var mount = buildVolume(script, r, '$LANDO_APP_ROOT_BIND');
        services[name].volumes = addConfig(mount, services[name].volumes);
      });
    }

    // Process any compose overrides we might have
    if (_.has(config, 'overrides')) {
      lando.log.debug('Overriding %s with', name, config.overrides);

      // Handle service merging
      services[name] = mergeOver(services[name], config.overrides.services);

      // Merge in the other things
      volumes = _.mergeWith(volumes, config.overrides.volumes, merger);
      networks = _.mergeWith(networks, config.overrides.networks, merger);

    }

    // Return the built compose file
    return {
      networks: networks,
      services: services,
      volumes: volumes
    };

  };

  return {
    add: add,
    addConfig: addConfig,
    addHelper: addHelper,
    addScript: addScript,
    build: build,
    buildVolume: buildVolume,
    get: get,
    info: info,
    mergeOver: mergeOver,
    moveConfig: moveConfig
  };

};
