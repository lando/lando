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
  var Promise = lando.Promise;

  /*
   * Helper function to determine wheness
   */
  var whenIt = function(method, func, answers) {

    // Run the whenit func if applicable
    if (_.includes(lando.init.get(), method)) {
      if (_.isFunction(lando.init.get(method)[func])) {
        return lando.init.get(method)[func](answers);
      }
    }

    // Otherwise show it
    else {
      return true;
    }

  };

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
        when: function(answers) {
          return whenIt(lando.tasks.argv()._[2], 'whenRecipe', answers);
        },
        choices: _.map(lando.recipes.get(), function(recipe) {
          return {name: recipe, value: recipe};
        }),
        weight: 100
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
        when: function(answers) {
          return whenIt(answers.recipe, 'whenWebRoot', answers);
        },
        weight: 900
      }
    },
    yes: {
      describe: 'Auto answer yes to prompts',
      alias: ['y'],
      default: false,
      boolean: true
    },
    overwrite: {
      interactive: {
        type: 'confirm',
        message: 'Are you sure you want to overwrite existing .lando.yml?',
        weight: 1000,
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

  // The task object
  return {
    command: 'init <appname> [method]',
    describe: 'Initializes a lando app called <appname> with optional [method]',
    options: _.merge(options, auxOpts),
    run: function(options) {

      // If we decline to overwrite then we are done
      if (options.overwrite === false) {
        console.log(chalk.yellow('Init cancelled!'));
        return;
      }

      // Set the basics
      var config = {
        name: options.appname,
        recipe: options.recipe,
      };

      // If we have a webroot let's set it
      if (!_.isEmpty(options.webroot)) {
        _.set(config, 'config.webroot', options.webroot);
      }

      // @todo: build step?
      // @todo: create new directory of appname? (seems safest) maybe we can alter options.destination inside the build step?
      // Build step
      return Promise.try(function() {
        var cmd = 'ssh-keygen -t rsa -N "" -C "lando" -f ' +
          '"/user/.lando/keys/test.id_rsa"';
        return lando.init.run(config.name, options.destination, cmd);
      })

      // Check to see if our recipe provides additional yaml augment
      .then(function() {
        return lando.init.yaml(options.recipe, config, options) || config;
      })

      // Create the lando yml
      .then(function(config) {

        // Create the file
        var dest = path.join(options.destination, '.lando.yml');

        // Construct the yamlfile
        lando.yaml.dump(dest, config);

      });

    }
  };

};
