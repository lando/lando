/**
 * Lando node elasticsearch example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
const http = require('http');
const express = require('express');
const Elasticsearch = require('elasticsearch');
const app = express();

// Get our elasticsearch client
const elasticsearch = new Elasticsearch.Client({
  host: 'search:9200',
  log: 'trace',
});

// Create our servers
http.createServer(app).listen(80);

// Try to connect to elasticsearch.
app.get('/', (req, res) => {
  res.header('Content-type', 'text/html');
  elasticsearch.ping({
  }, error => {
    if (error) {
      console.log(error);
      return res.end('elasticsearch cluster is down!' + JSON.stringify(error, null, 2));
    } else {
      return res.end('Elastic search contacted! All is well.');
    }
  });
});
