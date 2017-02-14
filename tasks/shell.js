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
   * Returns a BATS task
   */
  var batsTask = function(files) {

    // "Constants"
    var shellOpts = {execOptions: {maxBuffer: 20 * 1024 * 1024}};

    // BATS binary
    var bin = 'node_modules/bats/libexec/bats';
    var opts = '${CI:+--tap}';
    var cmd = [bin, opts, files.join(' ')];

    // Return our BATS task
    return {
      options: shellOpts,
      command: cmd.join(' '),
    };

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
    var configFile = path.join('encloseConfig.js');
    var entrypoint = path.join('bin', 'lando.js');
    var shellOpts = {
      execOptions: {
        maxBuffer: 20 * 1024 * 1024,
        cwd: 'build/cli'
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
    batsTask: batsTask,
    cliPkgTask: cliPkgTask,
    psTask: psTask,
    scriptTask: scriptTask
  };

};
