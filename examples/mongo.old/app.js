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

// Create our servers
http.createServer(app).listen(80);

// Try to connect to memcachef
app.get('/', (req, res) => {
  res.header('Content-type', 'text/html');

  // Establish connection to db
  const db = new Db('test', new Server('database', 27017));
  db.open((err, db) => {
    assert.equal(null, err);

    db.stats((err, stats) => {
      assert.equal(null, err);
      assert.ok(stats !== null);
      db.close();
      return res.end(JSON.stringify(stats));
    });
  });
});
