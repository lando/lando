/**
 * Lando node redis example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
const redis = require('thunk-redis');
const http = require('http');
const express = require('express');
const app = express();

// Create our server
http.createServer(app).listen(80);

// Try to connect to redis
app.get('/', (req, res) => {
  res.header('Content-type', 'text/html');
  // Get our redis client
  const cache = redis.createClient(6379, 'cache', {database: 1, usePromise: true});
  return cache.info('server').then(data => res.end('redis server info: ' + JSON.stringify(data, null, 2)));
});
