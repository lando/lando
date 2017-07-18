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

    // 80 Char Violators
    var pma = 'phpmyadmin';

    // Add the services
    lando.services.add('apache', require('./../apache/apache')(lando));
    lando.services.add('nginx', require('./../nginx/nginx')(lando));
    lando.services.add('node', require('./../node/node')(lando));
    lando.services.add('mailhog', require('./../mailhog/mailhog')(lando));
    lando.services.add('mariadb', require('./../mariadb/mariadb')(lando));
    lando.services.add('memcached', require('./../memcached/memcached')(lando));
    lando.services.add('mysql', require('./../mysql/mysql')(lando));
    lando.services.add('postgres', require('./../postgres/postgres')(lando));
    lando.services.add('php', require('./../php/php')(lando));
    lando.services.add(pma, require('./../phpmyadmin/phpmyadmin')(lando));
    lando.services.add('redis', require('./../redis/redis')(lando));
    lando.services.add('solr', require('./../solr/solr')(lando));
    lando.services.add('varnish', require('./../varnish/varnish')(lando));
    lando.services.add('elasticsearch',
      require('./../elasticsearch/elasticsearch')(lando));

  });

  // Go through our services and log them
  lando.events.on('post-bootstrap', 9, function(lando) {
    _.forEach(lando.services.get(), function(service) {
      lando.log.verbose('Service %s loaded', service);
    });
  });

};
