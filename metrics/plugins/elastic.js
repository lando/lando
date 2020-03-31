'use strict';

// Modules
const Client = require('elasticsearch').Client;
const Promise = require('bluebird');

/*
 * Creates a new ES instance.
 */
class Elasticsearch {
  constructor({host, index, type}) {
    this.index = index;
    this.type = type;
    // Build host url.
    this.host = host;
    // Create client.
    this.client = new Client({host: this.host});
  };

  /*
   * Ping connection.
   */
  ping() {
    const client = this.client;
    return Promise.fromNode(cb => {
      client.ping(cb);
    })
    .then(success => {
      if (!success) {
        return Promise.reject({
          status: 502,
          message: 'Could not reach the elasticsearch instance!',
        });
      }
    });
  };

  /*
   * Insert document into cluster.
   */
  report(data) {
    const {client, index, type} = this;
    // Insert document into cluster.
    return Promise.fromNode(cb => {
      client.index({index, type, body: data}, cb);
    });
  };

  /*
   * Close connection.
   */
  close() {
    this.client.close();
  };
}

/*
 * Return the class
 */
module.exports = Elasticsearch;
