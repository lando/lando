'use strict';

/**
 * Get lodash
 *
 * @since 3.0.0
 * @alias lando.node._
 * @example
 * // Get the lodash module
 * const _ = lando.node._;
 */
exports._ = require('lodash');

/**
 * Get chalk
 *
 * @since 3.0.0
 * @alias lando.node.chalk
 * @example
 * // Get the chalk module
 * const chalk = lando.node.chalk;
 */
exports.chalk = require('yargonaut').chalk();

/**
 * Get fs-extra
 *
 * @since 3.0.0
 * @alias lando.node.fs
 * @example
 * // Get the fs-extra module
 * const fs = lando.node.fs;
 */
exports.fs = require('fs-extra');

/**
 * Get object-hash
 * @since 3.0.0
 * @alias lando.node.hasher
 * @example
 * // Get the object-hash module
 * const hasher = lando.node.hasher;
 */
exports.hasher = require('object-hash');

/**
 * Get ip utils
 *
 * @since 3.0.0
 * @alias lando.node.ip
 * @example
 * // Get the ip module
 * const ip = lando.node.ip;
 */
exports.ip = require('ip');

/**
 * Get jsonfile
 *
 * @since 3.0.0
 * @alias lando.node.jsonfile
 * @example
 * // Get the jsonfile module
 * const jsonfile = lando.node.jsonfile;
 */
exports.jsonfile = require('jsonfile');

/**
 * Get axios
 *
 * @since 3.0.0
 * @alias lando.node.axios
 * @example
 * // Get the axios module
 * const rest = lando.node.axios;
 *
 * // Get it via the legacy hostname
 * const rest = lando.node.rest
 */
exports.axios = require('axios');
exports.rest = exports.axios;

/**
 * Get semver
 *
 * @since 3.0.0
 * @alias lando.node.semver
 * @example
 * // Get the semver module
 * const semver = lando.node.semver;
 */
exports.semver = require('semver');
