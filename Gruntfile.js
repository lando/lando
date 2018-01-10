'use strict';

module.exports = function(grunt) {

  // loads all grunt-* tasks based on package.json definitions
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  // Load in common information we can use across tasks
  var common = require('./tasks/common.js');

  // Load in delegated responsibilities because cleanliness => godliness
  var docs = require('./tasks/docs')(common);
  var fs = require('./tasks/fs.js')(common);
  var shell = require('./tasks/shell.js')(common);
  var tests = require('./tasks/tests.js')(common);
  var util = require('./tasks/util.js')(common);

  // Our Grunt config object
  var config = {

    // Linting, standards and styles tasks
    jshint: tests.jshint,
    jscs: tests.jscs,

    // Mocha tests
    mochacli: tests.unit,

    // Copying tasks
    copy: {
      cliBuild: fs.copy.cli.build,
      cliDist: fs.copy.cli.dist,
      installerBuild: fs.copy.installer.build,
      installerDist: fs.copy.installer.dist
    },

    // Copying tasks
    clean: {
      cliBuild: fs.clean.cli.build,
      cliDist: fs.clean.cli.dist,
      installerBuild: fs.clean.installer.build,
      installerDist: fs.clean.installer.dist
    },

    // Shell tasks
    shell: {
      cliPkg: shell.cliPkgTask(),
      gitBookBuild: shell.gitBookTask('build'),
      gitBookInstall: shell.gitBookTask('install'),
      gitBookServe: shell.gitBookTask('serve'),
      installerPkgosx: shell.scriptTask('./scripts/build-osx.sh'),
      installerPkglinux: shell.scriptTask('./scripts/build-linux.sh'),
      installerPkgwin32: shell.psTask('./scripts/build-win32.ps1'),
      installerosxBats: shell.batsTask(common.files.installerOsxBats),
      installerlinuxBats: shell.batsTask(common.files.installerLinuxBats)
    },

    // JS docs tasks
    jsdoc2md: docs.jsdoc2md,

    // Utility tasks
    bump: util.bump

  };

  // Load in all our task config
  grunt.initConfig(config);

  // Install and build our docs
  grunt.registerTask('docs', [
    'shell:gitBookInstall',
    'shell:gitBookBuild',
    'jsdoc2md'
  ]);

  // Serve our docs
  // NOTE: use this if you don't want to dogfood lando
  grunt.registerTask('serve', [
    'shell:gitBookInstall',
    'jsdoc2md',
    'shell:gitBookServe'
  ]);

  // Check Linting, standards and styles
  grunt.registerTask('test:code', [
    'jshint',
    'jscs'
  ]);

  // Unit tests
  grunt.registerTask('test:unit', [
    'mochacli'
  ]);

  // BATS tests
  grunt.registerTask('test:bats', [
    'shell:installer' + common.system.platform + 'Bats'
  ]);

  // All tests
  grunt.registerTask('test', [
    'test:code',
    'test:unit',
    'test:bats'
  ]);

  // Pkg the CLI binary
  grunt.registerTask('pkg:cli', [
    'clean:cliBuild',
    'clean:cliDist',
    'copy:cliBuild',
    'shell:cliPkg',
    'copy:cliDist'
  ]);

  // Build the installer
  //
  // @NOTE: for reasons that make me want to stab my eyes out with a fucking
  // spoon, you need to grunt pkg:gui BEFORE pkg:cli or sass:compile will
  // hang on Windows. THOU HAST BEEN WARNED.
  //
  grunt.registerTask('pkg', [
    'clean:installerBuild',
    'clean:installerDist',
    'copy:installerBuild',
    'pkg:cli',
    'shell:installerPkg' + common.system.platform,
    'copy:installerDist'
  ]);

  // Bump our minor version
  grunt.registerTask('bigrelease', [
    'bump:minor'
  ]);

  // Bump our patch version
  grunt.registerTask('release', [
    'bump:patch'
  ]);

  // Do a prerelease version
  grunt.registerTask('prerelease', [
    'bump:prerelease'
  ]);

};
