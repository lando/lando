'use strict';

/**
 * This file/module contains all our shell based Grunt tasks
 */

// Find the NW path

module.exports = function(common) {

  // Node modules
  var path = require('path');

  // Get the platform
  var platform = common.system.platform;

  /*
   * Helper function to do the correct npm install
   */
  var npmInstallCmd = function() {

    // Return the command as a string
    return 'npm install --production';

  };

  /*
   * Constructs the CLI PKG task
   */
  var cliPkgTask = function() {

    // Path to the enclose command
    var encloseDir = path.resolve(__dirname, '..', 'node_modules', 'enclose');
    var encloseBin = path.join(encloseDir, 'bin', 'enclose.js');

    // "Constants"
    var pkgName = 'lando-' + common.lando.pkgType;
    var configFile = path.resolve(__dirname, '..', 'encloseConfig.js');
    var entrypoint = path.resolve(__dirname, '..', 'bin', 'lando.js');
    var shellOpts = {
      execOptions: {
        cwd: 'build/cli',
        maxBuffer: 20 * 1024 * 1024
      }
    };

    // Enclose package command
    var encloseCmd = [
      encloseBin,
      '-c ' + configFile,
      '-o ' + pkgName,
      entrypoint
    ];

    // Start to build the command
    var cmd = [];
    cmd.push(npmInstallCmd());
    cmd.push(encloseCmd.join(' '));

    // Add executable perms on POSIX
    if (platform !== 'win32') {
      cmd.push('chmod +x ' + pkgName);
      cmd.push('sleep 2');
    }

    // Return the CLI build task
    return {
      options: shellOpts,
      command: cmd.join(' && ')
    };

  };

  // Return our things
  return {
    cliPkgTask: cliPkgTask
  };

};
