/**
 * This adds sharing settings to our config
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
    lando.log.info('Initializing services');

    // Add services to lando
    lando.services = require('./services')(lando);

  });

  // Add particular services to lando
  lando.events.on('post-bootstrap', function(lando) {

    // Add the services
    lando.services.add('nginx', require('./../nginx/nginx')(lando));
    lando.services.add('apache', require('./../apache/apache')(lando));
    lando.services.add('mariadb', require('./../mariadb/mariadb')(lando));
    lando.services.add('mysql', require('./../mysql/mysql')(lando));

  });

  // Go through our services and log them
  lando.events.on('post-bootstrap', 9, function(lando) {
    _.forEach(lando.services.get(), function(service) {
      lando.log.verbose('Service %s loaded', service);
    });
  });

};
