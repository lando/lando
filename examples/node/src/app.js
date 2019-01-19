/**
 * Lando node express example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const app = express();

// Create our HTTPS server options
const key = fs.readFileSync('/certs/cert.key')
const cert = fs.readFileSync('/certs/cert.crt'),

// Create our servers
https.createServer({key, cert}, app).listen(443);
http.createServer(app).listen(80);

// Basic HTTP response
app.get('/', (req, res) => {
  res.header('Content-type', 'text/html');
  return res.end('<h1>I said "Oh my!" What a marvelous tune!!!</h1>');
});
