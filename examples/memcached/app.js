/**
 * Lando node memcache example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
const http = require('http');
const express = require('express');
const Memcached = require('memcached');
const app = express();

// Get our memcached client
const memcached = new Memcached('cache:11211');

// Create our servers
http.createServer(app).listen(80);

// Try to connect to memcachef
app.get('/', (req, res) => {
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
