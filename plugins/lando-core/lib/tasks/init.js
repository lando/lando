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

  // Create the starting set of options/questions
  var options = {
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
        weight: 700
      }
    }
  };

  // Merge in other options provided by method plugins
  _.forEach(lando.init.get(), function(method) {
    options = _.merge(options, lando.init.get(method).options);
  });

  // Specify more auxopts
  var auxOpts = {
    destination: {
      describe: 'Specify where to init the app',
      alias: ['dest', 'd'],
      string: true,
      interactive: {
        type: 'input',
        message: 'Where do you want to create this app?',
        default: process.cwd(),
        weight: 800
      }
    },
    webroot: {
      describe: 'Specify the webroot relative to destination',
      string: true,
      interactive: {
        type: 'input',
        message: 'Where is your webroot relative to the init destination?',
        default: '.',
        weight: 900
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
        weight: 1000
      }
    },
    overwrite: {
      interactive: {
        type: 'confirm',
        message: 'Are you sure you want to overwrite existing .lando.yml?',
        weight: 1100,
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

  // Build optional init method arg
  var methods = ' [' + lando.init.get().join('|') + ']';

  // The task object
  return {
    command: 'init <appname>' + methods,
    describe: 'Initializes a lando app called <appname> with optional [method]',
    options: _.merge(options, auxOpts),
    run: function(options) {

      //console.log(options);

      // If we decline to overwrite then we are done
      if (options.overwrite === false) {
        console.log(chalk.yellow('Init cancelled!'));
        return;
      }

      // Run any build tasks defined by our source selection
      //lando.init.build(options)

      // Do the normal lando create jam
      return lando.init.yamlme(options);

    }
  };

};
