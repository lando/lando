'use strict';

module.exports = lando => {
  /*
    LANDO_CA_CERT: '/lando/certs/' + path.basename(lando.config.caCert),
    LANDO_CA_KEY: '/lando/certs/' + path.basename(lando.config.caKey),
    LANDO_DOMAIN: lando.config.proxyDomain,
  */
  const uid = lando.user.getUid();
  const gid = lando.user.getGid();

  // Return some config to merge in
  return {
    config: {
      appEnv: {
        COLUMNS: 256,
        LANDO: 'ON',
        LANDO_CONFIG_DIR: lando.config.userConfRoot,
        LANDO_HOST_HOME: lando.config.home,
        LANDO_HOST_OS: lando.config.os.platform,
        LANDO_HOST_UID: uid,
        LANDO_HOST_GID: gid,
        LANDO_HOST_IP: (process.platform !== 'linux') ? lando.node.ip.address() : 'host.docker.internal',
        LANDO_WEBROOT_USER: 'www-data',
        LANDO_WEBROOT_GROUP: 'www-data',
        LANDO_WEBROOT_UID: '33',
        LANDO_WEBROOT_GID: '33',
      },
      appLabels: {
        'io.lando.container': 'TRUE',
        'io.lando.id': lando.config.instance,
      },
      gid,
      uid,
    },
  };
};

/*
ENGINE PLUGIN

*/

/*
APP PLUGIN
// Modules
  // Merge compose files specified in landofile to services/networks/volumes
  lando.events.on('post-instantiate-app', 1, app => {

    // Inject values from an .env file if it exists
    if (fs.existsSync(path.join(app.root, '.env'))) {
      // Log
      lando.log.debug('.env file found for %s, loading its config', app.name);

      // Load .env file
      const result = dotenv.config();

      // warn if needed
      if (result.error) {
        lando.log.warn('Trouble parsing .env file with %s', result.error);
      }

      // Merge in values to app.env
      if (!_.isEmpty(result.parsed)) {
        app.env = merger(app.env, result.parsed);
      }
    }
  });

  // Do things all the way at the end
  lando.events.on('post-instantiate-app', 9, app => {
    // Add in some globals
    app.events.on('app-ready', 8, () => {
      // Add a copy of the app to opts for passthru considerations
      app.opts = {app: _.cloneDeep(app)};
    });

    // Also gather info on a start
    app.events.on('post-start', 1, () => {
      return lando.app.info(app);
    });

    // Scan our URLs and add a list of them and their status to the app
    app.events.on('post-start', 9, () => {
      // Get app URLs
      const urls = _.filter(_.flatMap(app.info, 'urls'), _.identity);

      // Scan the urls
      return lando.scanUrls(urls, {max: 17})

      // Add our URLS to the app
      .then(urls => {
        app.urls = urls;
      });
    });
  });
*/

