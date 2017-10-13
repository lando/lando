/**
 * This adds service settings to our config
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

    // Services
    var services = [
      'apache',
      'dotnet',
      'elasticsearch',
      'go',
      'nginx',
      'node',
      'mailhog',
      'mariadb',
      'memcached',
      'mssql',
      'mongo',
      'mysql',
      'postgres',
      'php',
      'phpmyadmin',
      'python',
      'redis',
      'ruby',
      'solr',
      'varnish'
    ];

    // Load the services
    _.forEach(services, function(service) {
      var serviceModule = './../' + [service, service].join('/');
      lando.services.add(service, require(serviceModule)(lando));
    });

  });

  // Go through our services and log them
  lando.events.on('post-bootstrap', 9, function(lando) {
    _.forEach(lando.services.get(), function(service) {
      lando.log.verbose('Service %s loaded', service);
    });
  });

};
