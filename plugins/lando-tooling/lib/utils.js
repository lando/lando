'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * Helper to process args
 */
exports.largs = config => {
  // We assume pass through commands so let's use argv directly and strip out
  // the first three assuming they are [node, lando.js, options.name]'
  const argopts = process.argv.slice(3);

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
exports.getContainerPath = appRoot => {
  // Break up our app root and cwd so we can get a diff
  const cwd = process.cwd().split(path.sep);
  const dir = _.drop(cwd, appRoot.split(path.sep).length);

  // Add our in-container app root
  dir.unshift('"$LANDO_MOUNT"');

  // Return the directory
  return dir.join('/');
};
