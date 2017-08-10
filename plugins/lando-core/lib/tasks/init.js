/**
 * Command to init a lando app
 *
 * @name init
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _  = lando.node._;
  var fs = lando.node.fs;
  var path = require('path');
  var Promise = lando.Promise;

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
        weight: 500
      }
    }
  };

  // Merge in or alter other options provided by method plugins
  _.forEach(lando.init.get(), function(method) {
    options = _.merge(options, lando.init.get(method).options);
  });

  // Specify more auxopts
  var auxOpts = {
    destination: {
      describe: 'Specify where to init the app',
      alias: ['dest', 'd'],
      string: true,
      default: process.cwd()
    },
    webroot: {
      describe: 'Specify the webroot relative to destination',
      string: true,
      interactive: {
        type: 'input',
        message: 'Where is your webroot relative to the init destination?',
        default: '.',
        when: function(answers) {
          var recipe = answers.recipe || lando.tasks.argv().recipe;
          return lando.recipes.webroot(recipe);
        },
        weight: 900,
      }
    },
    yes: {
      describe: 'Auto answer yes to prompts',
      alias: ['y'],
      default: false,
      boolean: true
    }
  };

  // The task object
  return {
    command: 'init <appname> [method]',
    describe: 'Initialize a lando app called <appname> using optional [method]',
    options: _.merge(options, auxOpts),
    run: function(options) {

      // Set the basics
      var config = {
        name: options.appname,
        recipe: options.recipe,
      };

      // If we have a webroot let's set it
      if (!_.isEmpty(options.webroot)) {
        _.set(config, 'config.webroot', options.webroot);
      }

      // Method specific build steps if applicable
      return Promise.try(function() {
        return lando.init.build(config.name, options.method, options);
      })

      // Kill any build containers if needed
      .then(function() {
        return lando.init.kill(config.name, options.destination);
      })

      // Check to see if our recipe provides additional yaml augment
      .then(function() {
        return lando.init.yaml(options.recipe, config, options);
      })

      // Create the lando yml
      .then(function(config) {

        // Where are we going?
        var dest = path.join(options.destination, '.lando.yml');

        // Rebase on top of any existing yaml
        if (fs.existsSync(dest)) {
          var pec = lando.yaml.load(dest);
          config = _.mergeWith(pec, config, lando.utils.merger);
        }

        // Dump it
        lando.yaml.dump(dest, config);

      })

      // Tell the user things
      .then(function() {

        // Header it
        console.log(lando.cli.initHeader());

        // Grab a new cli table
        var table = new lando.cli.Table();

        // Get docs link
        var docBase = 'https://docs.lndo.io/tutorials/';
        var docUrl = docBase + config.recipe + '.html';

        // Add data
        table.add('NAME', options.appname);
        table.add('RECIPE', options.recipe);
        table.add('DOCS', docUrl);

        // Add some other things if needed
        if (!_.isEmpty(options.method)) {
          table.add('METHOD', options.method);
        }

        // Print the table
        console.log(table.toString());

        // Space it
        console.log('');

      });

    }
  };

};
