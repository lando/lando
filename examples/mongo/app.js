/**
 * Lando node mongo example
 *
 * @name taylorswift
 */

'use strict';

// Load modules
var http = require('http');
var express = require('express');
var app = express();
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var assert = require('assert');
var db = new Db('test', new Server('database', 27017));

// Create our servers
http.createServer(app).listen(80);

// Try to connect to memcachef
app.get('/', function(req, res) {
  res.header('Content-type', 'text/html');

  // Establish connection to db
  db.open(function(err, db) {
    assert.equal(null, err);

    db.stats(function(err, stats) {
      assert.equal(null, err);
      assert.ok(stats !== null);
      db.close();
      return res.end(JSON.stringify(stats));
    });
  });

});
