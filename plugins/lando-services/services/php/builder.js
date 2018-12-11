'use strict';

// Modules
const _ = require('lodash');
const semver = require('semver');

/*
 * Helper to build a package string
 */
const getPackage = (pkg, version) => (!_.isEmpty(version)) ? `${pkg}:${version}` : pkg;

/*
 * Helper to get global deps
 * @TODO: this looks pretty testable? should services have libs?
 */
const getComposerCommands = deps => _(deps)
  .map((version, pkg) => ['composer', 'global', 'require', getPackage(pkg, version)])
  .map(command => command.join(' '))
  .value();

// Builder
module.exports = {
  name: 'php',
  config: {
    version: '7.2',
    supported: ['7.2', '7.1', '7.0', '5.6', '5.5', '5.4', '5.3'],
    legacy: ['5.5', '5.4', '5.3'],
    path: [
      '/app/vendor/bin',
      '/usr/local/sbin',
      '/usr/local/bin',
      '/usr/sbin',
      '/usr/bin',
      '/sbin',
      '/bin',
      '/var/www/.composer/vendor/bin',
    ],
    confSrc: __dirname,
    command: ['sh -c \'a2enmod rewrite && apache2-foreground\''],
    image: 'apache',
    defaultFiles: {
      _php: 'php.ini',
      vhosts: 'default.conf',
      // server: @TODO? DO THE PEOPLE DEMAND IT?
    },
    environment: {
      COMPOSER_ALLOW_SUPERUSER: 1,
    },
    remoteFiles: {
      _php: '/usr/local/etc/php/conf.d/xxx-lando-default.ini',
      vhosts: '/etc/apache2/sites-enabled/000-default.conf',
      php: '/usr/local/etc/php/conf.d/zzz-lando-my-custom.ini',
    },
    ssl: false,
    via: 'apache',
    volumes: [
      '/var/www/.composer',
      '/usr/local/bin',
    ],
    webroot: '.',
  },
  parent: '_appserver',
  builder: (parent, config) => class LandoPhp extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      // Apache
      if (options.via === 'apache') {
        options.volumes.push(`${options.confDest}/${options.defaultFiles.vhosts}:${options.remoteFiles.vhosts}`);
        if (options.version === '5.3') {
          options.remoteFiles._php = '/usr/local/lib/conf.d/xxx-lando-default.ini';
          options.remoteFiles.php = '/usr/local/lib/conf.d/zzz-lando-my-custom.ini';
          options.environment.APACHE_LOG_DIR = '/var/log';
        }
      // nginx
      } else if (config.via === 'nginx') {
        options.command = (process.platform !== 'win32') ? ['php-fpm'] : ['php-fpm -R'];
        options.image = 'fpm';
        options.remoteFiles.vhosts = '/opt/bitnami/extra/nginx/templates/default.conf.tpl';
        options.defaultFiles.vhosts = 'default.conf.tpl';
        if (process.platform === 'win32') {
          options.volumes.push(`${options.confDest}/zz-lando.conf:/usr/local/etc/php-fpm.d/zz-lando.conf`);
        }
        options.remoteFiles.pool = '/usr/local/etc/php-fpm.d/zz-lando.conf';
      // cli
      } else if (config.via === 'cli') {
        options.command = ['tail -f /dev/null'];
      }

      // Mount our default php config
      options.volumes.push(`${options.confDest}/${options.defaultFiles._php}:${options.remoteFiles._php}`);

      // Shift on the docker entrypoint if this is a more recent version
      // @TODO: can we assume we will always have major.minor for php release?
      if (semver.gt(`${options.version}.0`, '5.5.0')) options.command.unshift('docker-php-entrypoint');

      // Build the php
      const php = {
        // @TODO: new images with xdebug off?
        image: `devwithlando/php:${options.version}-${options.image}-2`,
        environment: _.merge({}, options.environment, {
          PATH: options.path.join(':'),
          LANDO_WEBROOT: `/app/${options.webroot}`,
          XDEBUG_CONFIG: `remote_enable=true remote_host=${options._app.env.LANDO_HOST_IP}`,
        }),
        networks: (options.via === 'nginx') ? {default: {aliases: ['fpm']}} : {default: {}},
        ports: (options.via === 'apache') ? ['80'] : [],
        volumes: options.volumes,
        command: options.command.join(' '),
      };

      // Add our composer things to run step
      if (!_.isEmpty(options.composer)) {
        const commands = getComposerCommands(options.composer);
        const current = _.get(options._app, `config.services.${options.name}.build_internal`, []);
        _.set(options._app, `config.services.${options.name}.build_internal`, _.flatten([commands, current]));
      }

      // Add activate/deactive steps for xdebug
      if (options.xdebug) {
        const current = _.get(options._app, `config.services.${options.name}.build_as_root_internal`, []);
        _.set(
          options._app,
          `config.services.${options.name}.build_as_root_internal`,
          _.flatten([['docker-php-ext-enable xdebug'], current])
        );
      }

      /*
      const nginx = config => {
        // Add a version to the type if applicable
        const type = ['nginx', config.via.split(':')[1]].join(':');

        // Handle our nginx config
        const defaultConfFile = (config.ssl) ? 'default-ssl.conf' : 'default.conf';
        const configFile = ['php', defaultConfFile];
        const mount = buildVolume(configFile, config.serverConf, scd);
        const nginxConfigDefaults = {
          server: _.dropRight(mount.split(':')).join(':'),
        };

        // Clone the config so we can separate concerns
        // This is mostly done so we can remove undesireable overrides like
        // resetting the service image
        const appConfig = _.cloneDeep(config);

        // Don't allow us to override the image/build here
        if (_.has(appConfig, 'overrides.services.image')) {
          delete appConfig.overrides.services.image;
        }
        if (_.has(appConfig, 'overrides.services.build')) {
          delete appConfig.overrides.services.build;
        }

        // Set the nginx config
        appConfig.config = _.merge(nginxConfigDefaults, appConfig.config);

        // Generate a config object to build the service with
        const name = appConfig.name;
        const nginx = lando.services.build(name, type, appConfig).services[name];

        // Add a depends on
        _.set(nginx, 'depends_on', [name]);

        // Return the object
        return nginx;
      };

      */

      // Send it downstream
      super(id, options, {
        services: _.set({}, options.name, php),
        volumes: _.set({}, 'data', {}),
      });
    };
  },
};
