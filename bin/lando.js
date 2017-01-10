#!/usr/bin/env node

/**
 * Main CLI entrypoint to use the lando libraries
 * This file is meant to be linked as a "lando" executable.
 *
 * @name lando
 */

'use strict';

// Grab the core API
var lando = require('./../lib/lando.js');

// Initialization options.
var opts = {
  mode: 'cli'
};

/*
 * Ensure all uncaught exceptions get handled.
 */
process.on('uncaughtException', lando.error.handleError);

// Initialize core library.
lando.bootstrap(opts)

.catch(function(err) {
  throw Error(err);
})

.then(function() {
  console.log('WE BOOTSTRAPPED!');
});
