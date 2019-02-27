'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const toObject = require('./../../../lib/utils').toObject;

// @NOTE: move below helpers to lib

// Helper to get named volume
const getNamedVolumeName = exclude => 'exclude_' + path.normalize(exclude).split(path.sep).join('_');

// Helper to map exclude directories to named volume name
const getNamedVolumeNames = (excludes = []) => _(excludes)
  .map(exclude => getNamedVolumeName(exclude))
  .value();

// Helper to get named volumes
exports.getNamedVolumes = (excludes = []) => toObject(getNamedVolumeNames(excludes));

// Get service volumes
exports.getServiceVolumes = (excludes = [], base = '/tmp') => _(excludes)
  .map(exclude => ({mount: getNamedVolumeName(exclude), path: path.join(base, exclude)}))
  .map(exclude => `${exclude.mount}:${exclude.path}`)
  .value();
