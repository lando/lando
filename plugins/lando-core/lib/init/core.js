/**
 * Core init things
 *
 * @name core
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // List of sources provided by this module
  var sources = ['directory', 'url'];

  // List of additional options
  var options = {
    directory: {
      describe: 'The directory ',
      alias: ['s'],
      string: true,
      choices: sources,
      interactive: {
        type: 'list',
        message: 'Where are we getting this app from?',
        default: 'custom',
        choices: _.map(sources, function(source) {
          return {name: source, value: source};
        }),
        weight: 60
      }
    },
  };

  /**
   * Build out Drupal 6
   */
  var build = function() {

    // Return the things
    return {};

  };

  // Return the things
  return {
    build: build,
    sources: sources,
    options: options
  };

};
