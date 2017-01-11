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

// Initialize.
bootstrap({mode: 'cli'})

// Other stuff
.then(function(lando) {
  process.on('uncaughtException', lando.error.handleError);
})

// Catch.
.catch(function(err) {
  throw new Error(err);
});
