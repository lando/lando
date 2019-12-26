'use strict';

// Just some basic API status indicators
module.exports = (api, handler) => {
  api.get('/', handler((req, res) => ({ping: 'pong'})));
  api.get('/v1', handler((req, res) => ({ping: 'pong'})));
};
