/*
var APP_ROOT_DIRNAME = process.env.LANDO_CORE_APP_ROOT_DIRNAME || 'Lando';
var LANDOFILE_NAME = process.env.LANDO_CORE_LANDOFILE_NAME || '.lando.yml';
var user = require('./user');

//appConfigFilename: LANDOFILE_NAME,
//appsRoot: path.join(env.home, APP_ROOT_DIRNAME),
//appRegistry: path.join(env.userConfRoot, 'appRegistry.json'),
//cache: true,
//composeBin: env.composeBin,
//composeVersion: '3.2',
//containerGlobalEnv: {},
//dockerBin: env.dockerBin,
//dockerBinDir: env.dockerBinDir,
//engineId: user.getEngineUserId(),
//engineGid: user.getEngineUserGid(),
//loadPassphraseProtectedKeys: false,

/*

// Add docker executables path to path to handle weird situations where
// the user may not have machine in their path
var pathString = (process.platform === 'win32') ? 'Path' : 'PATH';
var binPath = getDockerBinPath();
if (!_.startsWith(env[pathString], binPath)) {
  env[pathString] = [binPath, process.env[pathString]].join(path.delimiter);
}

/*
 * Helper to get location of docker bin directory
 */
/*
var getDockerBinPath = function() {
  switch (process.platform) {
    case 'darwin':
      return path.join('/Applications/Docker.app/Contents/Resources', 'bin');
    case 'linux':
      return path.join(getSysConfRoot(), 'bin');
    case 'win32':
      var programFiles = process.env.ProgramW6432 || process.env.ProgramFiles;
      return path.join(programFiles + '\\Docker\\Docker\\resources\\bin');
  }
};
*/

/*
 * Get docker compose binary path
 */
 /*
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
*/

/*
 * This should only be needed for linux
 */
 /*
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
*/
