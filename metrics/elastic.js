'use strict';

var elastic = require('elasticsearch');
var Promise = require('bluebird');
var util = require('util');
var VError = require('verror');

/*
 * Constructor.
 */
function Db(opts) {
  // Default options.
  opts = opts || {};
  this.index = opts.index;
  this.type = opts.type;
  // Build host url.
  this.host = opts.host;
  // Create client.
  this.client = elastic.Client({
    host: this.host
  });
}

/*
 * Close connection.
 */
Db.prototype.close = function() {
  this.client.close();
};

/*
 * Ping cluster.
 */
Db.prototype.ping = function() {
  var self = this;
  // Ping cluster.
  return Promise.fromNode(function(cb) {
    self.client.ping(cb);
  })
  // Wrap errors.
  .catch(function(err) {
    throw new VError(err, 'Error pinging database.');
  });
};

/*
 * Insert document into cluster.
 */
Db.prototype.insert = function(doc) {
  var self = this;
  // Insert document into cluster.
  return Promise.fromNode(function(cb) {
    var data = {
      index: self.index,
      type: self.type,
      body: doc
    };
    self.client.index(data, cb);
  })
  // Log insertion.
  .tap(function() {
    console.log('ELASTIC: inserted document - ' + JSON.stringify(doc));
  })
  // Wrap errors.
  .catch(function(err) {
    throw new VError(err, 'Error inserting document: %s', JSON.stringify(doc));
  });
};

/*
 * Export constructor.
 */
module.exports = Db;
