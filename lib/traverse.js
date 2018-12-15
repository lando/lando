'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * Helper to traverse up directories from a start point
 * @NOTE: this lives in a separate file so we can load it directly from lib/bin.js
 * without paying the penalty incurreed from loading the other utils
 */
module.exports = file => _(_.range(path.dirname(file).split(path.sep).length))
  .map(end => _.dropRight(path.dirname(file).split(path.sep), end).join(path.sep))
  .map(dir => path.join(dir, path.basename(file)))
  .value();
