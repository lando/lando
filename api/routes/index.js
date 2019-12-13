module.exports = (api, handler) => {
  api.get('/v1', handler((req, res) => ({ping: 'pong'})));
};
