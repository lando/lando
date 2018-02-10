'use strict';

// Modules
var _ = require('lodash');

/**
 * Helper to process args
 */
exports.largs = function(config) {

  // We assume pass through commands so let's use argv directly and strip out
  // the first three assuming they are [node, lando.js, options.name]'
  var argopts = process.argv.slice(3);

  // Check to see if we have global lando opts and remove them if we do
  if (_.indexOf(argopts, '--') > 0) {
    argopts = _.slice(argopts, 0, _.indexOf(argopts, '--'));
  }

  // Return
  return _.flatten(argopts);

};
