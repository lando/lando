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
const key = fs.readFileSync('/certs/cert.key');
const cert = fs.readFileSync('/certs/cert.crt');

// Create our servers
https.createServer({key, cert}, app).listen(4444);
http.createServer(app).listen(3000);

// Basic HTTP response
app.get('/', (req, res) => {
  res.header('Content-type', 'text/html');
  return res.end('<h1>DANCING DANCING STARLIGHT</h1>');
});
