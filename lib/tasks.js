/**
 * Tasks module.
 *
 * @name tasks
 */

'use strict';

// Modules
var _ = require('./node')._;

// Yargonaut must come before yargs
var yargonaut = require('yargonaut');
yargonaut.style('green');
var yargs = require('yargs');

// Get our local args
exports.argv = yargs.argv;

// Get global lando verbose arg
exports.verbose = yargs(this.argv._)
  .global('verbose')
  .count('verbose')
  .alias('v', 'verbose')
  .argv.verbose;

/**
 * Initialize the CLI
 */
exports.cli = function(lando) {

  // Define our default CLI
  var yargs = require('yargs')
    .usage('Usage: $0 <command> [command options] [-- global options]')
    .epilog('Copyright 2017');

  // Emit the CLI loading event
  return lando.events.emit('cli-load', yargs)

  // Print our result
  .then(function() {

    // Finish up the yargs
    var args = yargs.argv;
    lando.log.verbose('CLI args', args);

    // Show help if needed and then exit(1)
    if (_.isEmpty(args._)) {
      yargs.showHelp();
      process.exit(1);
    }

  });

};
