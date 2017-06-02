/**
 * Lando node express example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
var fs = require('fs');
var http = require('http');
var express = require('express');
var SolrNode = require('solr-node');
var app = express();

// Create solr client
// This uses the internal_connection info from `lando info`.
var client = new SolrNode({
    host: 'index',
    port: '8983',
    core: 'freedom',
    protocol: 'http'
});

// Create our servers
http.createServer(app).listen(80);

// Basic HTTP response
app.get('/', function (req, res) {

  // Set the header
  res.header('Content-type', 'text/html');

  // Ping the solr intance
  client.ping(function(err, result) {
    if (err) {
      return res.end('<h1>I HAVE FAILED TO CONNECT</h1>');
    }
    else {
      res.end('<h1>I HAVE MADE A CONNECTION TO SOLR!!!</h1>');
    }
  })

});
