'use strict';

const copy = require('copy');
const fs = require('fs-extra');
const pkg = require('./../../package.json');
const path = require('path');
const util = require('./../util');
const version = pkg.version;

// Lando info
const pkgType = [util.platform, 'x64', 'v' + version].join('-');
const pkgExt = (util.platform === 'win32') ? '.exe' : '';
const pkgSuffix = pkgType + pkgExt;

// Define cli pkg name
const cliPkgName = 'lando-' + pkgSuffix;

const files = {
  // All js files
  // @todo: dustin, should be just get this list of files from package.json?
  // having to maintain two separate lists of files seems like a recipe for disaster
  build: [
    path.join('bin', '**', '*.js'),
    path.join('lib', '**'),
    path.join('plugins', '**'),
    path.join('config.yml'),
    path.join('package.json'),
    path.join('yarn.lock'),
  ],
  clean: {
    cli: {
      build: [path.join('build', 'cli', path.sep)],
      dist: [path.join('dist', 'cli', path.sep)],
    },
    installer: {
      build: [path.join('build', 'installer', path.sep)],
      dist: [path.join('dist', path.sep)],
    },
  },
  // Our copy tasks
  copy: {
    cli: {
      dist: {
        src: path.join('build', 'cli', cliPkgName),
        dest: path.join('dist', 'cli', cliPkgName),
        options: {
          mode: true,
        },
      },
    },
    installer: {
      build: {
        cwd: path.join('installer', util.platform, path.sep),
        src: ['**'],
        dest: path.join('build', 'installer', path.sep),
        expand: true,
        options: {
          mode: true,
        },
      },
      dist: {
        cwd: path.join('build', 'installer', 'dist', path.sep),
        src: ['**'],
        dest: path.join('dist', path.sep),
        expand: true,
        options: {
          mode: true,
        },
      },
    },
  },
};

module.exports = {

  /*
   * Helper function to clean multiple directories.
   */
  clean: directories => {
    return directories.map(dir => {
      dir.map(nestedDir => {
        return fs.emptyDirSync(nestedDir);
      });
    });
  },

  /*
   * Package the CLI.
   */
  pkgCli: function() {
    this.clean([files.clean.cli.build, files.clean.cli.dist]);
    copy(files.build, path.join('build', 'cli'), {srcBase: '.'}, (err, files) => {
      if (err) throw err;
    });
    const pkgCmd = this.cliPkgTask();
    return util.shellExec(pkgCmd).then(result => fs.copy(files.copy.cli.dist.src, files.copy.cli.dist.dest, err => {
      if (err) throw err;
    }));
  },

  /*
   * Build full installer
   */
  pkgInstaller: platform => {
    const extension = (platform === 'win32') ? 'ps1' : 'sh';
    const script = path.join('scripts', `build-${platform}.${extension}`);
    const task = extension => (extension === 'ps1') ? util.psTask(script) : util.scriptTask(script);
    return util.shellExec(task(extension));
  },

  /*
   * Run the full packager
   */
  pkgFull: function() {
    this.clean([files.clean.installer.build, files.clean.installer.dist]);
    copy(
      path.join('installer', util.platform, '**'),
      path.join('build', 'installer', path.sep),
      {mode: true, srcBase: path.join('installer', util.platform, path.sep)},
      (err, files) => {
        if (err) throw err;
      }
    );
    this.pkgCli().then(result => {
      this.pkgInstaller(util.platform).then(result => copy(
        path.join('build', 'installer', 'dist', '**'),
        path.join('dist'),
        {mode: true, srcBase: path.join('build', 'installer', 'dist', path.sep)},
        (err, files) => {
          if (err) throw err;
        }
      ));
    });
  },

  /*
   * Constructs the CLI PKG task
   */
  cliPkgTask: () => {
    // Path to the pkg command
    const binDir = path.resolve(__dirname, '..', '..', 'node_modules', 'pkg');
    const pkg = path.join(binDir, 'lib-es5', 'bin.js');

    // Get target info
    const node = 'node8';
    let os = process.platform;
    const arch = 'x64';

    // Rename the OS because i guess we want to be different than process.platform?
    if (process.platform === 'darwin') {
      os = 'macos';
    } else if (process.platform === 'win32') {
      os = 'win';
    }

    // Exec options
    const pkgName = cliPkgName;
    const configFile = path.join('package.json');
    const entrypoint = path.join('bin', 'lando.js');
    const target = [node, os, arch].join('-');
    const shellOpts = {
      execOptions: {
        stdout: true,
        stderr: true,
        stdin: true,
        failOnError: true,
        stdinRawMode: false,
        preferLocal: true,
        maxBuffer: 20 * 1024 * 1024,
      },
    };

    // Package command
    const pkgCmd = [
      'node',
      pkg,
      '--targets ' + target,
      '--config ' + configFile,
      '--output ' + pkgName,
      entrypoint,
    ];

    // Start to build the command
    const cmd = [];
    const cliBuild = path.join('build', 'cli', path.sep);
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
      command: cmd.join(' && '),
    };
  },

};
