'use strict';

/**
 * This file/module contains helpful docs tasks.
 */

module.exports = function() {

  /*
   * Increments the version number, etc.
   */
  return {
    jsdoc2md: {
      separateOutputFilePerInput: {
        files: [
          {src: 'lib/lando.js', dest: 'docs/dev/api/lando.md'},
          {src: 'lib/app.js', dest: 'docs/dev/api/app.md'}
        ]
      }
    }
  };

};
