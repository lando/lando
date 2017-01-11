#!/usr/bin/env node

/**
 * Main CLI entrypoint to use the lando libraries
 * This file is meant to be linked as a "lando" executable.
 *
 * @name lando
 */

'use strict';

// Grab the core LANDO API.
var lando = require('./../lib/lando.js');

// Ensure all uncaught exceptions get handled.
process.on('uncaughtException', lando.error.handleError);

// Initialize.
lando.bootstrap({mode: 'cli'})

// Catch.
.catch(lando.error.handleError);
