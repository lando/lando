/**
 * Contains helpful node modules that can be called directly from Lando.
 *
 * These are useful so that plugins are not required to manage their own node
 * dependencies with a `package.json` file which can be annoying esp for small and lightweight
 * plugins.
 *
 * @since 3.0.0
 * @module node
 * @example
 *
 * // Get the lodash module
 * var _ = lando.node._;
 *
 * // Get the restler module
 * var restler = lando.node.restler;
 *
 */

'use strict';

/**
 * Get lodash
 *
 * @since 3.0.0
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
 * @example
 *
 * // Get the fs-extra module
 * var fs = lando.node.fs;
 */
exports.fs = require('fs-extra');

/**
 * Get ip utils
 *
 * @since 3.0.0
 * @example
 *
 * // Get the ip module
 * var ip = lando.node.ip;
 */
exports.ip = require('ip');

/**
 * Get object-hash
 *
 * @since 3.0.0
 * @example
 *
 * // Get the object-hash module
 * var hasher = lando.node.hasher;
 */
exports.hasher = require('object-hash');

/**
 * Get jsonfile
 *
 * @since 3.0.0
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
 * @example
 *
 * // Get the restler module
 * var rest = lando.node.rest;
 */
exports.rest = require('restler');
