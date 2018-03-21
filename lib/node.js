'use strict';

/**
 * Get lodash
 *
 * @since 3.0.0
 * @alias 'lando.node._'
 * @example
 *
 * // Get the lodash module
 * var _ = lando.node._;
 */
exports._ = require('lodash');

/**
 * Get chalk
 *
 * @since 3.0.0
 * @alias 'lando.node.chalk'
 * @example
 *
 * // Get the chalk module
 * var chalk = lando.node.chalk;
 */
exports.chalk = require('yargonaut').chalk();

/**
 * Get fs-extra
 *
 * @since 3.0.0
 * @alias 'lando.node.fs'
 * @example
 *
 * // Get the fs-extra module
 * var fs = lando.node.fs;
 */
exports.fs = require('fs-extra');

/**
 * Get object-hash
 *
 * @since 3.0.0
 * @alias 'lando.node.hasher'
 * @example
 *
 * // Get the object-hash module
 * var hasher = lando.node.hasher;
 */
exports.hasher = require('object-hash');

/**
 * Get ip utils
 *
 * @since 3.0.0
 * @alias 'lando.node.ip'
 * @example
 *
 * // Get the ip module
 * var ip = lando.node.ip;
 */
exports.ip = require('ip');

/**
 * Get jsonfile
 *
 * @since 3.0.0
 * @alias 'lando.node.jsonfile'
 * @example
 *
 * // Get the jsonfile module
 * var jsonfile = lando.node.jsonfile;
 */
exports.jsonfile = require('jsonfile');

/**
 * Get restler
 *
 * @since 3.0.0
 * @alias 'lando.node.rest'
 * @example
 *
 * // Get the restler module
 * var rest = lando.node.rest;
 */
exports.rest = require('restler');

/**
 * Get semver
 *
 * @since 3.0.0
 * @alias 'lando.node.semver'
 * @example
 *
 * // Get the semver module
 * var semver = lando.node.semver;
 */
exports.semver = require('semver');
