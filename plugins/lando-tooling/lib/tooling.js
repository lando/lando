/**
 * This does the tooling
 *
 * @name tooling
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /*
   * Helper to process args
   */
  var largs = function(config) {

    // We assume pass through commands so let's use argv directly and strip out
    // the first three assuming they are [node, lando.js, options.name]
    var argopts = process.argv.slice(3);

    // Shift on our command
    argopts.unshift(config.cmd);

    // Check to see if we have global lando opts and remove them if we do
    if (_.indexOf(argopts, '--') > 0) {
      argopts = _.slice(argopts, 0, _.indexOf(argopts, '--'));
    }

    // Return
    return argopts.join(' ');

  };

  /*
   * The task builder
   */
  var build = function(config) {

    /*
     * Get the run handler
     */
    var run = function(/*options*/) {

      // Let's check to see if the app has been started
      return lando.app.isRunning(config.app)

      // If not let's make sure we start it
      .then(function(isRunning) {
        if (!isRunning) {
          return lando.app.start(config.app);
        }
      })

      // Run the command
      .then(function() {

        // Build the command
        var cmd = largs(config);

        // Get the appname
        var appName = config.app.name.replace(/-/g, '');

        // Exec
        return lando.engine.run({
          id: [appName, config.service, '1'].join('_'),
          cmd: cmd,
          opts: {mode: 'attach'}
        });

      });

    };

    // Build the task
    var task = {
      command: config.name,
      describe: config.description,
      run: run
    };

    // Return our tasks
    return task;

  };

  // Return things
  return {
    build: build
  };

};
