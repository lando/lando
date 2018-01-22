'use strict';
const common = require('../../tasks/common');
const shellTask = require('../../tasks/shell')(common);
const copy = require('copy');
const fs = require('fs-extra');
const path = require('path');
const util = require('../util');

// Define cli pkg name
const cliPkgName = 'lando-' + common.lando.pkgSuffix;

const files = {
  // All js files
  build: [
    path.join('bin', '**', '*.js'),
    path.join('lib', '**', '*.js'),
    path.join('plugins', '**', '*.js'),
    path.join('package.json'),
    path.join('yarn.lock')
  ],
  clean: {
    cli: {
      build: [path.join('build', 'cli', path.sep)],
      dist: [path.join('dist', 'cli', path.sep)]
    },
    installer: {
      build: [path.join('build', 'installer', path.sep)],
      dist: [path.join('dist', path.sep)]
    }
  },
  // Our copy tasks
  copy: {
    cli: {
      dist: {
        src: path.join('build', 'cli', cliPkgName),
        dest: path.join('dist', 'cli', cliPkgName),
        options: {
          mode: true
        }
      }
    },
    installer: {
      build: {
        cwd: path.join('installer', common.system.platform, path.sep),
        src: ['**'],
        dest: path.join('build', 'installer', path.sep),
        expand: true,
        options: {
          mode: true
        }
      },
      dist: {
        cwd: path.join('build', 'installer', 'dist', path.sep),
        src: ['**'],
        dest: path.join('dist', path.sep),
        expand: true,
        options: {
          mode: true
        }
      }
    }
  },
};

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

  /**
   * Package the CLI.
   *
   * @return {Promise} Chain of the packager followed by copy.
   */
  pkgCli: function() {
    this.clean([files.clean.cli.build, files.clean.cli.dist]);
    copy(files.build, path.join('build', 'cli'), {srcBase: '.'}, (err, files) => { if (err) { throw err; } });
    const pkgCmd = this.cliPkgTask();
    return util.shellExec(pkgCmd).then((result) => fs.copy(files.copy.cli.dist.src, files.copy.cli.dist.dest, (err) => {
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
    const script = path.join('scripts', `build-${platform}.${extension}`);

    const task = function(extension) {
      if (extension === 'ps1') {
        return shellTask.psTask(script);
      } else {
        return shellTask.scriptTask(script);
      }
    };

    return util.shellExec(task(extension));
  },

  /**
   * Run the full packager
   */
  pkgFull: function() {
    this.clean([files.clean.installer.build, files.clean.installer.dist]);
    copy(
      path.join('installer', common.system.platform, '**'),
      path.join('build', 'installer', path.sep),
      {mode: true, srcBase: path.join('installer', common.system.platform, path.sep)},
      (err, files) => { if (err) throw err; }
    );
    this.pkgCli().then((result) => {
      this.pkgInstaller(common.system.platform).then((result) => copy(
          path.join('build', 'installer', 'dist', '**'),
          path.join('dist'),
          {mode: true, srcBase: path.join('build', 'installer', 'dist', path.sep)},
          (err, files) => { if (err) throw err; }
        ));
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
    var cliBuild = path.join('build', 'cli', path.sep);
    cmd.push('cd ' + cliBuild);
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
