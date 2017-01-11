'use strict';

module.exports = function(lando) {
  // Load CLI tasks for this plugin.
  //require('./lib/tasks.js')(kbox);
  // Load core events for this plugin.
  //require('./lib/events.js')(kbox);

  lando.events.on('pre-bootstrap', function(config) {
    console.log(config);
  });

  lando.events.on('post-bootstrap', 1, function(lando) {
    lando.log.silly('hello 1');
  });

  lando.events.on('post-bootstrap', 9, function(lando) {
    lando.log.silly('hello 9');
  });

  lando.events.on('post-bootstrap', 4, function(lando) {
    lando.log.silly('hello 4');
  });

};
