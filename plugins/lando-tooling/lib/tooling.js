/**
 * This does the tooling
 *
 * @name tooling
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var path = require('path');
  var format = require('util').format;

  /*
   * Helper to process args
   */
  var largs = function(config) {

    // We assume pass through commands so let's use argv directly and strip out
    // the first three assuming they are [node, lando.js, options.name]
    var argopts = process.argv.slice(3);

    // Shift on our command
    argopts.unshift(config.cmd || config.name);

    // Check to see if we have global lando opts and remove them if we do
    if (_.indexOf(argopts, '--') > 0) {
      argopts = _.slice(argopts, 0, _.indexOf(argopts, '--'));
    }

    // Return
    return _.flatten(argopts);

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

        // Break up our app root and cwd so we can get a diff
        var appRoot = config.app.root.split(path.sep);
        var cwd = process.cwd().split(path.sep);
        var dir = _.difference(cwd, appRoot);

        // Add our in-container app root
        dir.unshift('"$LANDO_MOUNT"');

        // Build out our options
        var options = {
          id: [config.app.dockerName, config.service, '1'].join('_'),
          cmd: cmd,
          opts: {
            mode: 'attach',
            pre: ['cd', dir.join('/')].join(' '),
            user: config.user || 'root'
          }
        };

        // Exec
        return lando.engine.run(options);

      });

    };

    // Return our tasks
    return {
      command: config.name,
      describe: config.description || format('Run %s commands', config.name),
      run: run
    };

  };

  // Return things
  return {
    build: build
  };

};
