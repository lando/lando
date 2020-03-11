/**
 * Lando node express example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
const http = require('http');
const express = require('express');
const app = express();

// Create our server
http.createServer(app).listen(80);

// Basic HTTP response
app.get('/', (req, res) => {
  res.header('Content-type', 'text/html');
  return res.end('<h1>I said "Oh my!" What a marvelous tune!!!</h1>');
});
