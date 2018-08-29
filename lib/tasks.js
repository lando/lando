'use strict';

// Modules
const _ = require('lodash');

/**
 * A singleton array that contains all the tasks that have been added.
 *
 * @since 3.0.0
 * @alias lando.tasks.tasks
 * @example
 *
 * // Gets all the tasks that have been loaded
 * const task = lando.tasks.tasks;
 */
exports.tasks = [];

/**
 * Adds a Lando task to the global `lando.tasks.task` object.
 *
 * A lando task object is an abstraction on top of [yargs](http://yargs.js.org/docs/)
 * and [inquirer](https://github.com/sboudrias/Inquirer.js) with a little extra special sauce.
 *
 * @since 3.0.0
 * @alias lando.tasks.add
 * @see [yargs docs](http://yargs.js.org/docs/)
 * @see [inquirer docs](https://github.com/sboudrias/Inquirer.js)
 * @param {String} name The name of the task.
 * @param {Object} task A Lando task object
 * @param {String} task.command A [yargs formatted command](http://yargs.js.org/docs/#methods-commandmodule-positional-arguments)
 * @param {String} task.description A short description of the command
 * @param {Object} task.options A [yargs builder object](http://yargs.js.org/docs/#methods-commandmodule). Each builder also has an 'interactive' key which is an [inquirier question object](https://github.com/sboudrias/Inquirer.js#objects)
 * @param {Function} task.run The function to run when the task is invoked.
 * @return {Array} The task object
 * @example
 *
 * // Define a task
 * const task = {
 *   command: 'destroy [appname]',
 *   describe: 'Destroy app in current directory or [appname]',
 *   options: {
 *     yes: {
 *       describe: 'Auto answer yes to prompts',
 *       alias: ['y'],
 *       default: false,
 *       boolean: true,
 *       interactive: {
 *         type: 'confirm',
 *         message: 'Are you sure you want to DESTROY?',
 *       },
 *     },
 *   },
 *   run: options => {
 *     console.log(options);
 *   }
 * };
 *
 * // Add the task to Lando
 * lando.tasks.add('destroy', task);
 */
exports.add = (name, task) => {
  // Minimal task validation, just checking that common properties exist. If not, throw error.
  if (!(name && _.has(task, 'command') && _.has(task, 'describe') && _.has(task, 'run'))) {
    throw new Error('The task object is not valid, please see https://docs.devwithlando.io/api/api.html#landotasksadd');
  }
  // Return
  return exports.tasks.push(_.merge({}, task, {name: name}));
};
