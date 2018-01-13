'use strict';
const common = require('../../tasks/common');
const fsTasks = require('../../tasks/fs')(common);
const shellTask = require('../../tasks/shell')(common);
const copy = require('copy');
const fs = require('fs-extra');
const path = require('path');
const util = require('../util');


module.exports = {

  /**
   * Helper function to clean multiple directories.
   *
   * @param {Array} directories
   */
  clean: function (directories) {
    return directories.map(function(dir) {
      dir.map(function(nestedDir) {
        return fs.emptyDirSync(nestedDir);
      });
    });
  },

  copyOp: function(src = [], dest = '') {
    return src.map(function(reference) {
      copy(reference, dest, {srcBase: '.'}, function(err, files) {
        if (err) throw err;
      });
    });
  },

  /**
   * Package the CLI.
   *
   * @return {Promise} Chain of the packager followed by copy.
   */
  pkgCli: function() {
    this.clean([fsTasks.clean.cli.build, fsTasks.clean.cli.dist]);
    copy(common.files.build, 'build/cli/', {srcBase: '.'}, (err, files) => { if (err) { throw err; } });
    const pkgCmd = this.cliPkgTask();
    return util.shellExec(pkgCmd).then((result) => fs.copy(fsTasks.copy.cli.dist.src, fsTasks.copy.cli.dist.dest, (err) => {
      if (err) { throw  err; }
    }));
  },

  /**
   * Build full installer
   * @param platform
   * @returns {Promise}
   */
  pkgInstaller: function(platform) {
    const extension = (platform === 'win32') ? 'ps1' : 'sh';
    return util.shellExec(
      shellTask.scriptTask(
        'scripts/build-' + platform + '.' + extension
      )
    );
  },

  /**
   * Run the full packager
   */
  pkgFull: function() {
    this.clean([fsTasks.clean.installer.build, fsTasks.clean.installer.dist]);
    copy('installer/' + common.system.platform + '/**', 'build/installer', {mode: true, srcBase: 'installer/' + common.system.platform}, (err, files) => { if (err) throw err; });
    this.pkgCli().then((result) => {
      this.pkgInstaller(common.system.platform).then((result) => {
      copy('build/installer/dist/**', 'dist/', {mode: true, srcBase: 'build/installer/dist/'}, (err, files) => {
      if (err) throw err;
    });
  }, function (result) {
      return console.log('Done!');
    });
  });
  },

  /*
   * Constructs the CLI PKG task
   */
  cliPkgTask: function() {

    // Path to the pkg command
    var binDir = path.resolve(__dirname, '..', '..', 'node_modules', 'pkg');
    var pkg = path.join(binDir, 'lib-es5', 'bin.js');

    // Get target info
    var node = 'node8';
    var os = process.platform;
    var arch = 'x64';

    // Rename the OS because i guess we want to be different than process.platform?
    if (process.platform === 'darwin') {
      os = 'macos';
    }
    else if (process.platform === 'win32') {
      os = 'win';
    }

    // Exec options
    var pkgName = 'lando-' + common.lando.pkgSuffix;
    var configFile = path.join('package.json');
    var entrypoint = path.join('bin', 'lando.js');
    var target = [node, os, arch].join('-');
    var shellOpts = {
      execOptions: {
        stdout: true,
        stderr: true,
        stdin: true,
        failOnError: true,
        stdinRawMode: false,
        preferLocal: true,
        maxBuffer: 20 * 1024 * 1024,
        cwd: 'build/cli'
      }
    };

    // Package command
    var pkgCmd = [
      'node',
      pkg,
      '--targets ' + target,
      '--config ' + configFile,
      '--output ' + pkgName,
      entrypoint
    ];

    // Start to build the command
    var cmd = [];
    cmd.push('cd build/cli');
    cmd.push('yarn --production');
    cmd.push(pkgCmd.join(' '));

    // Add executable perms on POSIX
    if (process.platform !== 'win32') {
      cmd.push('chmod +x ' + pkgName);
      cmd.push('sleep 2');
    }

    // Return the CLI build task
    return {
      options: shellOpts,
      command: cmd.join(' && ')
    };

  }


};
