'use strict';

// Modules
var _ = require('lodash');
var path = require('path');

/*
 * Helper to process args
 */
exports.largs = function(config) {

  // We assume pass through commands so let's use argv directly and strip out
  // the first three assuming they are [node, lando.js, options.name]'
  var argopts = process.argv.slice(3);

  // Check to see if we have global lando opts and remove them if we do
  if (_.indexOf(argopts, '--') >= 0) {
    argopts = _.slice(argopts, 0, _.indexOf(argopts, '--'));
  }

  // Return
  return _.flatten(argopts);

};

/*
 * Helper to map the cwd on the host to the one in the container
 */
exports.getContainerPath = function(appRoot) {

  // Break up our app root and cwd so we can get a diff
  var appRoot = appRoot.split(path.sep);
  var cwd = process.cwd().split(path.sep);
  var dir = _.drop(cwd, appRoot.length);

  // Add our in-container app root
  dir.unshift('"$LANDO_MOUNT"');

  // Return the directory
  return dir.join('/');

};
