'use strict';

/**
 * This file/module contains helpful util tasks.
 */

module.exports = function() {

  // Files to change
  var files = ['package.json'];

  /*
   * Increments the version number, etc.
   */
  return {
    bump: {
      options: {
        files: files,
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: files,
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1',
        globalReplace: false,
        prereleaseName: 'beta',
        metadata: '',
        regExp: false
      }
    }
  };

};
