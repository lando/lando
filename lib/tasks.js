/**
 * Tasks module.
 *
 * @name tasks
 */

'use strict';

// Modules
var chalk = require('./node').chalk;
var parse = require('yargs-parser');

// Yargonaut must come before yargs
var yargonaut = require('yargonaut');
yargonaut.style('green').errorsStyle('red');

// Get yargs
var yargs = require('yargs');

// Get global lando verbose arg
exports.largv = parse(parse(process.argv.slice(2))._, {
  alias: {'verbose': ['v'], 'help': ['h']},
  count: ['v']
});

/**
 * Initialize the CLI
 */
exports.cli = function(lando) {

  // Define our default CLI
  yargs.usage('Usage: $0 <command> [args] [options] [-- global options]');

  // Emit the CLI loading event
  return lando.events.emit('cli-load', yargs)

  // Print our result
  .then(function() {

    // Create epilogue for our global options
    var epilogue = [
      chalk.green('Global Options:\n'),
      '  --verbose, -v, -vv, -vvv, -vvvv  verbosity of output'
    ];

    // Finish up the yargs
    var argv = yargs
      .help('help')
      .alias('help', ['h'])
      .demandCommand(1, 'You need at least one command before moving on')
      .epilog(epilogue.join(''))
      .argv;

    lando.log.debug('CLI args', argv);

  });

};
