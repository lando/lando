/**
 * Lando node memcache example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
var http = require('http');
var express = require('express');
var Memcached = require('memcached');
var app = express();

// Get our memcached client
var memcached = new Memcached('cache:11211');

// Create our servers
http.createServer(app).listen(80);

// Try to connect to memcachef
app.get('/', function(req, res) {

  res.header('Content-type', 'text/html');

  // Try to get stats about our memcache connection
  memcached.set('foo', 'bar', 10, function() {
    memcached.gets('foo', function() {
      memcached.stats(function(err, data) {
        return res.end(JSON.stringify(data, null, 2));
      });
    });
  });

});
