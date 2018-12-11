'use strict';

// Load modules
const http = require('http');
const express = require('express');
const solr = require('solr-client');
const app = express();

// Create solr client
// This uses the internal_connection info from `lando info`.
const client = new solr.createClient({
  host: 'index',
  port: '8983',
  core: 'freedom',
  solrVersion: '5.1',
});

// Create our servers
http.createServer(app).listen(80);

// Basic HTTP response
app.get('/', (req, res) => {
  // Set the header
  res.header('Content-type', 'text/html');
  // Ping the solr intance
  client.ping((err, result) => {
    if (err) {
      return res.end('<h1>I HAVE FAILED TO CONNECT</h1>' + err);
    } else {
      return res.end('<h1>I HAVE MADE A CONNECTION TO SOLR!!!</h1>' + JSON.stringify(result));
    }
  });
});
