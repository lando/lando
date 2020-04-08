'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const utils = require('./../../lib/utils');

/*
 * Build Drupal 7
 */
module.exports = {
  name: 'platformsh',
  parent: '_lamp',
  config: {
    build: [],
    build_root: [],
    run_root: [],
    cache: true,
    confSrc: __dirname,
    defaultFiles: {
      php: 'php.ini',
      database: 'mysql.cnf',
      server: 'nginx.conf.tpl',
    },
    edge: true,
    env: 'dev',
    framework: 'drupal',
    index: true,
    services: {appserver: {overrides: {
      volumes: [],
    }}},
    tooling: {terminus: {
      service: 'appserver',
    }},
    xdebug: false,
    webroot: '.',
  },
  builder: (parent, config) => class LandoPlatformsh extends parent {
    constructor(id, options = {}) {
      const platformshConfig = utils.getPlatformshConfig([
        path.join(options.root, '.platform.app.yaml'),
        path.join(options.root, '.platform/services.yaml'),
      ]);
      console.log(platformshConfig);
      console.log(options);
      exit(1);

      // Merge in platformsh ymlz
      options = _.merge({}, config, options, platformshConfig);

      // Normalize because 7.0 right away gets handled strangely by js-yaml
      if (options.php === '7' || options.php === 7) options.php = '7.0';
      // Enforce certain options for platformsh parity
      options.via = 'nginx:1.14';
      options.database = 'mariadb:10.1';
      // Set correct things based on framework
      options.defaultFiles.vhosts = `${options.framework}.conf.tpl`;
      // Use our custom platformsh images
      // TODO: Add platform.sh image.
      // options.services.appserver.overrides.image = `devwithlando/platformsh-appserver:${options.php}-2`;
      // Add in the prepend.php
      // @TODO: this throws a weird DeprecationWarning: 'root' is deprecated, use 'global' for reasons not immediately clear
      // So we are doing this a little weirdly to avoid hat until we can track things down better
      options.services.appserver.overrides.volumes.push(`${options.confDest}/prepend.php:/srv/includes/prepend.php`);
      // Add in our environment
      options.services.appserver.overrides.environment = utils.getPlatformshEnvironment(options);
      // Add in our platformsh script
      // NOTE: We do this here instead of in /scripts because we need to guarantee
      // it runs before the other build steps so it can reset our CA correctly
      options.build_root.push('/helpers/platformsh.sh');
      options.build.push('/helpers/auth.sh');
      options.run_root.push('/helpers/binding.sh');
      // Add in cache if applicable
      if (options.cache) options = _.merge({}, options, utils.getPlatformshCache());
      // Add in edge if applicable
      if (options.edge) options = _.merge({}, options, utils.getPlatformshEdge(options));
      // Add in index if applicable
      if (options.index) options = _.merge({}, options, utils.getPlatformshIndex());

      // Add in the framework-correct tooling
      options.tooling = _.merge({}, options.tooling, utils.getPlatformshTooling(options.framework));
      // Add in the framework-correct build steps
      options.build = utils.getPlatformshBuildSteps(options.framework).concat(options.build);

      // Send downstream
      super(id, options);
    };
  },
};
