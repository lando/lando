'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;

  /*
   * Helper to return backdrop settings
   */
  const backdropSettings = config => {
    return JSON.stringify({
      databases: {
        default: {
          default: {
            driver: 'mysql',
            database: config._recipe,
            username: config._recipe,
            password: config._recipe,
            host: 'database',
            port: 3306,
          },
        },
      },
    });
  };

  /*
   * Helper to download and install backdrop drush cmds
   */
  const getBackdrush = backdrush => {
    // Return immediately if no backdrush
    if (!backdrush) {
      return 'echo "Not installing Backdrop Drush"';
    }

    // Define stable and dev versions
    const version = {
      dev: '1.x-0.x',
      stable: '0.0.6',
    };

    // Get the base URL
    const baseUrl = 'https://github.com/backdrop-contrib/drush/archive/';

    // Get the user config
    const isSpecial = _.includes(['dev', 'stable'], backdrush);
    const release = (isSpecial) ? version[backdrush] : backdrush;

    // Get the URL and dest
    const download = baseUrl + release + '.tar.gz';
    const dest = '~/.drush';

    // Curl and tar
    const curl = ['curl', '-fsSL', download];
    const tar = ['tar', '-xz', '--strip-components=1', '-C', dest];

    // Backdrush install command
    const backdrushInstall = [
      ['mkdir', '-p', dest],
      _.flatten([curl, ['|'], tar]),
      ['drush', 'cc', 'drush'],
    ];

    // Return
    return _.map(backdrushInstall, cmd => {
      return cmd.join(' ');
    }).join(' && ');
  };

  /*
   * Build out Backdrop
   */
  const build = (name, config) => {
    // Set the default php version for Backdrop
    config.php = _.get(config, 'php', '7.0');

    // Get the backdrush config
    const backdrush = _.get(config, 'backdrush', 'stable');

    // Use drush defaults for D7 unless backdrush is set to false
    if (backdrush === false) {
      config.drush = false;
    }

    // Start by cheating
    const build = lando.recipes.build(name, 'drupal7', config);

    // Get appserver ENV
    const envKey = 'services.appserver.overrides.services.environment';
    const env = _.get(build, envKey, {});

    // Set backdrop ENV
    env.BACKDROP_SETTINGS = backdropSettings(config);
    _.set(build, envKey, env);

    // Determine the service to run cli things on
    const unsupportedCli = (config.php === '5.3' || config.php === 5.3);
    const cliService = (unsupportedCli) ? 'appserver_cli' : 'appserver';

    // Build an additional cli container if we are running unsupported
    if (unsupportedCli) {
      // Build out a CLI container and modify as appropriate
      const cliImage = 'devwithlando/php:5.5-fpm';
      build.services[cliService] = _.cloneDeep(build.services.appserver);
      build.services[cliService].type = 'php:5.5';
      build.services[cliService].via = 'cli';
      build.services[cliService].overrides.services.image = cliImage;

      // Remove stuff from appserver
      delete build.services.appserver.run_internal;

      // Override some tooling things
      build.tooling.drush.service = cliService;
    }

    // Get appserver build
    const buildersKey = 'services.' + cliService + '.run_internal';
    const builders = _.get(build, buildersKey, []);

    // Add the backdrop install command
    builders.push(getBackdrush(backdrush));
    _.set(build, buildersKey, builders);

    // Return the things
    return build;
  };

  // Return the things
  return {
    build: build,
    configDir: __dirname,
  };
};
