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
          {src: 'lib/app.js', dest: 'docs/dev/api/app.md'},
          {src: 'lib/bootstrap.js', dest: 'docs/dev/api/bootstrap.md'},
          {src: 'lib/cache.js', dest: 'docs/dev/api/cache.md'},
          {src: 'lib/cli.js', dest: 'docs/dev/api/cli.md'},
          {src: 'lib/config.js', dest: 'docs/dev/api/config.md'},
          {src: 'lib/engine.js', dest: 'docs/dev/api/engine.md'},
          {src: 'lib/error.js', dest: 'docs/dev/api/error.md'},
          {src: 'lib/events.js', dest: 'docs/dev/api/events.md'},
          {src: 'lib/logger.js', dest: 'docs/dev/api/log.md'},
          {src: 'lib/networks.js', dest: 'docs/dev/api/networks.md'},
          {src: 'lib/node.js', dest: 'docs/dev/api/node.md'},
          {src: 'lib/plugins.js', dest: 'docs/dev/api/plugins.md'},
          {src: 'lib/promise.js', dest: 'docs/dev/api/promise.md'},
          {src: 'lib/registry.js', dest: 'docs/dev/api/registry.md'},
          {src: 'lib/shell.js', dest: 'docs/dev/api/shell.md'},
          {src: 'lib/tasks.js', dest: 'docs/dev/api/tasks.md'},
          {src: 'lib/user.js', dest: 'docs/dev/api/user.md'},
          {src: 'lib/utils.js', dest: 'docs/dev/api/utils.md'},
          {src: 'lib/yaml.js', dest: 'docs/dev/api/yaml.md'}
        ]
      }
    }
  };

};
