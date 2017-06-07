/**
 * Lando node redis example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
var redis = require('thunk-redis')
var fs = require('fs');
var http = require('http');
var express = require('express');
var util = require('util');
var app = express();

// Create our server
http.createServer(app).listen(80);

// Get our redis client
var cache = redis.createClient(6379, 'cache', {database: 1, usePromise: true});

// Try to connect to redis
app.get('/', function(req, res) {

  res.header('Content-type', 'text/html');

  // Print info about server
  return cache.info('server')
  .then(function (data) {
    return res.end('redis server info: ' + JSON.stringify(data, null, 2));
  });

});
