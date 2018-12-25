/**
 * Lando node mongo example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
const http = require('http');
const express = require('express');
const app = express();
const Db = require('mongodb').Db;
const Server = require('mongodb').Server;
const assert = require('assert');
const db = new Db('test', new Server('database', 27017));

// Create our servers
http.createServer(app).listen(80);

// Try to connect to memcachef
app.get('/', (req, res) => {
  res.header('Content-type', 'text/html');
  db.open((err, db) => {
    if (err) return res.end('Waiting on mongo...');
    else {
      db.stats((err, stats) => {
        db.close();
        return res.end(JSON.stringify(stats));
      });
    }
  });
});
