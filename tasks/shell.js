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
   * Run a default bash/sh/cmd script
   */
  var scriptTask = function(cmd) {

    // "Constants"
    var shellOpts = {execOptions: {maxBuffer: 20 * 1024 * 1024}};

    // Return our shell task
    return {
      options: shellOpts,
      command: cmd
    };

  };

  /*
   * Run a ps script
   */
  var psTask = function(cmd) {

    // "Constants"
    var shellOpts = {execOptions: {maxBuffer: 20 * 1024 * 1024}};
    var entrypoint = 'PowerShell -NoProfile -ExecutionPolicy Bypass -Command';

    // Return our ps task
    return {
      options: shellOpts,
      command: [entrypoint, cmd, '&& EXIT /B %errorlevel%'].join(' ')
    };

  };

  /*
   * Constructs the CLI PKG task
   */
  var cliPkgTask = function() {

    // Path to the enclose command
    var encloseDir = path.resolve(__dirname, '..', 'node_modules', 'enclose');
    var encloseBin = path.join(encloseDir, 'bin', 'enclose.js');

    // "Constants"
    var pkgName = 'lando-' + common.lando.pkgSuffix;
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
      'node',
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
    cliPkgTask: cliPkgTask,
    psTask: psTask,
    scriptTask: scriptTask
  };

};
