/**
 * This bootstraps the init framework
 *
 * @name bootstrap
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Add services modules to lando
  lando.events.on('post-bootstrap', 1, function(lando) {

    // Log
    lando.log.info('Initializing init framework');

    // Add init to lando
    lando.init = require('./init')(lando);

    // Load our tasks
    lando.tasks.add('config', require('./tasks/config')(lando));
    lando.tasks.add('destroy', require('./tasks/destroy')(lando));
    lando.tasks.add('info', require('./tasks/info')(lando));
    lando.tasks.add('list', require('./tasks/list')(lando));
    lando.tasks.add('logs', require('./tasks/logs')(lando));
    lando.tasks.add('poweroff', require('./tasks/poweroff')(lando));
    lando.tasks.add('rebuild', require('./tasks/rebuild')(lando));
    lando.tasks.add('restart', require('./tasks/restart')(lando));
    lando.tasks.add('start', require('./tasks/start')(lando));
    lando.tasks.add('stop', require('./tasks/stop')(lando));
    lando.tasks.add('version', require('./tasks/version')(lando));

  });

  // Add github init method
  lando.events.on('post-bootstrap', function(lando) {
    lando.init.add('github', require('./github')(lando));
  });

  // Go through our init methods and log them
  lando.events.on('post-bootstrap', 9, function(lando) {

    // Load the init task here because its special
    lando.tasks.add('init', require('./tasks/init')(lando));

    // Log
    _.forEach(lando.init.get(), function(method) {
      lando.log.verbose('Init method %s loaded', method);
    });

  });

};
