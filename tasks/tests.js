'use strict';

/**
 * This file/module contains helpful style/linting tasks.
 */

module.exports = function(common) {

  /*
   * Linting and code standards
   */
  return {
    eslint: {
      target: [common.files.js]
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
