'use strict';

module.exports = function(grunt) {

  // loads all grunt-* tasks based on package.json definitions
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  // Load in common information we can use across tasks
  var common = require('./tasks/common.js');

  // Load in delegated responsibilities because cleanliness => godliness
  var fs = require('./tasks/fs.js')(common);
  var shell = require('./tasks/shell.js')(common);
  var style = require('./tasks/style.js')(common);

  // Our Grut config object
  var config = {

    // Linting, standards and styles tasks
    jshint: style.jshint,
    jscs: style.jscs,

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
      installerPkgosx: shell.scriptTask('./scripts/build-osx.sh'),
      installerPkglinux: shell.scriptTask('./scripts/build-linux.sh'),
      installerPkgwin32: shell.psTask('./scripts/build-win32.ps1')
    }

  };

  // Load in all our task config
  grunt.initConfig(config);

  // Check Linting, standards and styles
  grunt.registerTask('test:code', [
    'jshint',
    'jscs'
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
  // spoon, you need to grun pkg:gui BEFORE pkg:cli or sass:compile will
  // hang on Windows. THOU HATH BEEN WARNED.
  //
  grunt.registerTask('pkg', [
    'clean:installerBuild',
    'clean:installerDist',
    'copy:installerBuild',
    'pkg:cli',
    'shell:installerPkg' + common.system.platform,
    'copy:installerDist'
  ]);

};
