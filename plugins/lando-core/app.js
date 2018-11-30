'use strict';

module.exports = app => ({
  env: {
    LANDO_APP_NAME: app.name,
    LANDO_APP_ROOT: app.root,
    LANDO_APP_ROOT_BIND: app.root,
  },
  labels: {
    'io.lando.src': app.configFile,
  },
});
