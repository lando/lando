'use strict';

/**
 * This contains all the core commands that kalabox can run on every machine
 */

module.exports = function(kbox) {

  // Npm modules
  var inquirer = require('inquirer');
  var chalk = require('chalk');
  var _ = require('lodash');

  kbox.core.events.on('post-app-load', function(app) {

    app.events.on('load-tasks', function() {

      kbox.tasks.add(function(task) {
        task.path = [app.name, 'destroy'];
        task.category = 'appAction';
        task.options.push({
          name: 'yes',
          alias: 'y',
          kind: 'boolean',
          description: 'Automatically answer affirmitive'
        });
        task.description = 'Completely destroys and removes an app.';
        task.func = function(done) {

          // Print helpful stuff to the user after their app has
          // been destroyed
          app.events.on('post-destroy', 9, function(/*app*/) {
            console.log(kbox.art.postDestroy());
          });

          // Needs to prompt?
          var confirmPrompt = !this.options.yes;

          // Display ominous warning if prompted
          if (confirmPrompt) {
            console.log(kbox.art.destroyWarn(app));
          }

          // Set up our confirmation question if needed
          var confirm = {
            type: 'confirm',
            name: 'doit',
            message: 'So, are you still prepared to DESTROY?',
            when: function(/*answers*/) {
              return confirmPrompt;
            },
            default: function() {
              return false;
            }
          };

          // Destroyer of worlds
          inquirer.prompt([confirm], function(answers) {

            // Set non-interactive if needed
            if (_.isEmpty(answers)) {
              answers.doit = !confirmPrompt;
            }

            // Destroy if confirmed
            if (answers.doit) {
              kbox.app.destroy(app, done);
            }
            // Print and exit
            else {
              console.log(chalk.green('WHEW! IMMINENT DESTRUCTION AVERTED!'));
              done();
            }

          });

        };
      });

    });

  });

};
