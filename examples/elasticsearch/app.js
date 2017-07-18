/**
 * Lando node elasticsearch example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
var http = require('http');
var express = require('express');
var Elasticsearch = require('elasticsearch');
var app = express();

// Get our elasticsearch client
var elasticsearch = new Elasticsearch.Client({
  host: 'search:9200',
  log: 'trace'
});

// Create our servers
http.createServer(app).listen(80);

// Try to connect to elasticsearch.
app.get('/', function(req, res) {

  res.header('Content-type', 'text/html');
  var info = 'Elasticsearch is not up.';
  elasticsearch.ping({
  }, function (error) {
    if (error) {
      console.log(error);
      return res.end('elasticsearch cluster is down!' + JSON.stringify(error, null, 2));
    } else {
      return res.end('Elastic search contacted! All is well.');
    }
  });
});
