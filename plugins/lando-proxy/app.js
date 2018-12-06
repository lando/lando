'use strict';

// Modules

module.exports = app => {
  const LandoProxy = app.factory.get('_proxy');
  const proxy = new LandoProxy(app._config);
  console.log(proxy);
};
