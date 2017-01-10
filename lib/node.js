/**
 * Main library entrypoint to get all of lando
 *
 * @name lando
 */

'use strict';

/*
 * Load lodash module
 */
exports._ = require('lodash');

/*
 * Load chalk module
 */
exports.chalk = require('chalk');

/*
 * Load configuration module
 */
exports.fs = require('fs-extra');

/*
 * Load log module
 */
exports.log = require('./logger');

/**
 * Load in some helpful node modules
 */
exports.node = require('./node');

/*
 * Load Promise module
 */
exports.Promise = require('./promise');
