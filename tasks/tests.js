'use strict';

/**
 * This file/module contains helpful style/linting tasks.
 */

module.exports = function(common) {

  /*
   * Linting and code standards
   */
  return {
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      cli: common.files.js
    },
    jscs: {
      options: {
        config: '.jscsrc'
      },
      cli: common.files.js
    },
    unit: {
      options: {
        bail: true,
        reporter: 'spec',
        timeout: 5000,
        recursive: true,
        env: {
          WINSTON_SHUTUP: true
        }
      },
      unit: common.files.jsTest
    }
  };

};
