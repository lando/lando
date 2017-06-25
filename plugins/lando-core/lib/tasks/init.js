/**
 * Command to init a lando app
 *
 * @name init
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _  = lando.node._;
  var chalk = lando.node.chalk;

  // Create the default set of options/questions
  var defaultOpts = {
    recipe: {
      describe: 'Specify the recipe with which we init',
      alias: ['r'],
      string: true,
      interactive: {
        type: 'list',
        message: 'What recipe do you want to use?',
        default: 'custom',
        choices: _.map(lando.recipes.get(), function(recipe) {
          return {name: recipe, value: recipe};
        })
      }
    },
    destination: {
      describe: 'Specify where to init the app',
      alias: ['dest', 'd'],
      string: true,
      interactive: {
        type: 'input',
        message: 'Where do you want to create this app?',
        default: process.cwd(),
        weight: 98
      }
    },
    webroot: {
      describe: 'Specify the webroot relative to destination',
      string: true,
      interactive: {
        type: 'input',
        message: 'Where is your webroot relative to the init destination?',
        default: '.',
        weight: 99
      }
    },
    yes: {
      describe: 'Auto answer yes to prompts',
      alias: ['y'],
      default: false,
      boolean: true,
      interactive: {
        type: 'confirm',
        message: 'Initialize?',
        weight: 100
      }
    }
  };

  // The task object
  return {
    command: 'init <appname>',
    describe: 'Initializes an app from source at target',
    options: defaultOpts,
    run: function(options) {
      console.log(options);
      console.log(chalk.red('OH YEAH!'));
    }
  };

};
