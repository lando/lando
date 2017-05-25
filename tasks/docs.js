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
      oneOutputFile: {
        src: 'lib/*.js',
        dest: 'docs/dev/api.md'
      }/*,
      separateOutputFilePerInput: {
        files: [
          {src: 'lib/engine.js', dest: 'api/engine.md'},
          {src: 'lib/app.js', dest: 'api/app.md'}
        ]
      },
      withOptions: {
        options: {
          'no-gfm': true
        },
        src: 'src/wardrobe.js',
        dest: 'api/with-index.md'
      }
      */
    }
  };

};
