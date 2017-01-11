#!/usr/bin/env node

/**
 * Main CLI entrypoint to use the lando libraries
 * This file is meant to be linked as a "lando" executable.
 *
 * @name lando
 */

'use strict';

// Grab stuff so we can bootstrap
var bootstrap = require('./../lib/bootstrap.js');
var errorHandler;

// Initialize
bootstrap({mode: 'cli'})

// Handle uncaught errors
.then(function(lando) {
  errorHandler = lando.error.handleError;
  process.on('uncaughtException', errorHandler);
})

// Catch errors
.catch(errorHandler);
