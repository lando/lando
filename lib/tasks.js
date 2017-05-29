/**
 * Things Things Things Things Things Things Things Things Things Things
 * Things Things Things Things Things Things
 * Things Things Things Things Things Things Things Things
 * Things Things Things Things Things Things
 *
 * @namespace tasks
 */

'use strict';

// Modules
var parse = require('yargs-parser');

/**
 * Place to store global tasks
 */
exports.tasks = {};

/**
 * Get global lando verbose arg
 */
exports.largv = parse(parse(process.argv.slice(2))._, {
  alias: {'verbose': ['v'], 'help': ['h']},
  count: ['v']
});

/**
 * Add a task.
 *
 * Either to the global task object or the passed in object
 */
exports.add = function(name, task, object) {

  // Add to passed in object if applicable
  if (object) {
    object.tasks[name] = task;
  }

  // Add to global task object otherwise
  else {
    this.tasks[name] = task;
  }

};
