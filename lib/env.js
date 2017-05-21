/**
 * Env module.
 *
 * @name env
 */

'use strict';

// Modules
var _ = require('./node')._;
var fs = require('./node').fs;
var os = require('os');
var path = require('path');

// Constants
var LANDO_SYS_CONF_DIRNAME = '.lando';

/**
 * Document
 */
var getHomeDir = function() {
  return os.homedir();
};

/**
 * Document
 */
var getUserConfRoot = function() {
  return path.join(getHomeDir(), LANDO_SYS_CONF_DIRNAME);
};

/**
 * Document
 */
var getSysConfRoot = function() {

  // Win path
  var win = process.env.LANDO_INSTALL_PATH || 'C:\\Program Files\\Lando';

  // Return sysConfRoot based on path
  switch (process.platform) {
    case 'win32': return win;
    case 'darwin': return '/Applications/Lando.app/Contents/MacOS';
    case 'linux': return '/usr/share/lando';
  }

};

/**
 * Document
 */
var getSourceRoot = function() {
  return path.resolve(__dirname, '..');
};

/*
 * Helper to get location of docker bin directory
 */
var getDockerBinPath = function() {
  switch (process.platform) {
    case 'darwin':
      return path.join('/Applications/Docker.app/Contents/Resources', 'bin');
    case 'linux':
      return path.join(getSysConfRoot(), 'bin');
    case 'win32':
      var programFiles = process.env.ProgramW6432;
      return path.join(programFiles + '\\Docker\\Docker\\resources\\bin');
  }
};

/*
 * Get docker compose binary path
 */
var getComposeExecutable = function() {

  // Get compose bin path
  var composePath = getDockerBinPath();
  var composeBin = path.join(composePath, 'docker-compose');

  // Return exec based on path
  switch (process.platform) {
    case 'darwin': return composeBin;
    case 'linux': return composeBin;
    case 'win32': return composeBin + '.exe';
  }

};

/*
 * This should only be needed for linux
 */
var getDockerExecutable = function() {

  // Get docker bin path
  var dockerPath = getDockerBinPath();
  var dockerBin = path.join(dockerPath, 'docker');

  // Return exec based on path
  switch (process.platform) {
    case 'darwin': return dockerBin;
    case 'linux': return '/usr/bin/docker';
    case 'win32': return dockerBin + '.exe';
  }

};

/*
 * Set process Env
 */
var getProcessEnv = function() {

  // Load up our initial env
  var env = process.env || {};

  // Set Path environmental variable if we are on windows so we get access
  // to things like ssh.exe
  if (process.platform === 'win32') {

    var appData = process.env.LOCALAPPDATA;
    var programFiles = process.env.ProgramFiles;
    var programFiles2 = process.env.ProgramW6432;
    var gitBin1 = path.join(appData, 'Programs', 'Git', 'usr', 'bin');
    var gitBin2 = path.join(programFiles, 'Git', 'usr', 'bin');
    var gitBin3 = path.join(programFiles2, 'Git', 'usr', 'bin');

    // Only add the gitbin to the path if the path doesn't start with
    // it. We want to make sure gitBin is first so other things like
    // putty don't F with it.
    //
    // See https://github.com/kalabox/kalabox/issues/342
    _.forEach([gitBin1, gitBin2, gitBin3], function(gBin) {
      if (fs.existsSync(gBin) && !_.startsWith(env.Path, gBin)) {
        env.Path = [gBin, env.Path].join(';');
      }
    });

  }

  // Add docker executables path to path to handle weird situations where
  // the user may not have machine in their path
  var pathString = (process.platform === 'win32') ? 'Path' : 'PATH';
  var binPath = getDockerBinPath();
  if (!_.startsWith(env[pathString], binPath)) {
    env[pathString] = [binPath, process.env[pathString]].join(path.delimiter);
  }

  // Return the env
  return env;

};

/**
 * Get config
 */
var getEnv = _.memoize(function() {
  return {
    composeBin: getComposeExecutable(),
    dockerBinDir: getDockerBinPath(),
    dockerBin: getDockerExecutable(),
    env: getProcessEnv(),
    home: getHomeDir(),
    srcRoot: getSourceRoot(),
    sysConfRoot: getSysConfRoot(),
    userConfRoot: getUserConfRoot(),
  };
});

/**
 * Export func to get conf
 */
module.exports = getEnv();
