'use strict';

const _ = require('lodash');

exports.escapedAnchor = function (anchor) {
  if (typeof anchor !== 'string') return null;
  return _.toLower(anchor.replace(/\W/g, ''));
};
