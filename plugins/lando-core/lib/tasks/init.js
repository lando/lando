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
  var fs = lando.node.fs;
  var path = require('path');

  // Create the default set of options/questions
  var defaultOpts = {
    recipe: {
      describe: 'The recipe to use',
      choices: lando.recipes.get(),
      alias: ['r'],
      string: true,
      interactive: {
        type: 'list',
        message: 'What recipe do you want to use?',
        default: 'custom',
        choices: _.map(lando.recipes.get(), function(recipe) {
          return {name: recipe, value: recipe};
        }),
        weight: 70
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
        weight: 80
      }
    },
    webroot: {
      describe: 'Specify the webroot relative to destination',
      string: true,
      interactive: {
        type: 'input',
        message: 'Where is your webroot relative to the init destination?',
        default: '.',
        weight: 90
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
    },
    overwrite: {
      interactive: {
        type: 'confirm',
        message: 'Are you sure you want to overwrite existing .lando.yml?',
        weight: 110,
        when: function(answers) {

          // Get things to check
          var lyaml = path.join(answers.destination, '.lando.yml');
          var yes = lando.tasks.argv().yes;
          var hasYaml = fs.existsSync(lyaml);

          // Determine whether to show
          return hasYaml && !yes;

        }
      }
    }
  };

  // @todo: Merge in additinal questions from any sources

  // The task object
  return {
    // @todo: add in [github|pantheon|etc] as opt arg
    command: 'init <appname>',
    describe: 'Initializes a lando app.',
    options: defaultOpts,
    run: function(options) {

      // If we decline to overwrite then we are done
      if (options.overwrite === false) {
        console.log(chalk.yellow('Init cancelled!'));
        return;
      }

      // Run any build tasks defined by our source selection

      // Do the normal lando create jam
      return lando.init.yamlme(options);

    }
  };

};
