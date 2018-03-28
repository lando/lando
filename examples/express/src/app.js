/**
 * Lando node express example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var app = express();

// Create our HTTPS server options
var sslOpts = {
  key: fs.readFileSync('/certs/cert.key'),
  cert: fs.readFileSync('/certs/cert.crt')
};

// Create our servers
https.createServer(sslOpts, app).listen(443);
http.createServer(app).listen(80);

// Basic HTTP response
app.get('/', function (req, res) {
  res.header('Content-type', 'text/html');
  return res.end('<h1>I said "Oh my!" What a marvelous tune!!!</h1>');
});
