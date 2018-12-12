'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
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

/*
 * Helper to parse php config
 */
const parseConfig = options => {
  // Apache
  if (options.via === 'apache') {
    options.volumes.push(`${options.confDest}/${options.defaultFiles.vhosts}:${options.remoteFiles.vhosts}`);
    if (options.version === '5.3') {
      options.remoteFiles._php = '/usr/local/lib/conf.d/xxx-lando-default.ini';
      options.remoteFiles.php = '/usr/local/lib/conf.d/zzz-lando-my-custom.ini';
      options.environment.APACHE_LOG_DIR = '/var/log';
    }
  // nginx
  } else if (options.via === 'nginx') {
    options.command = (process.platform !== 'win32') ? ['php-fpm'] : ['php-fpm -R'];
    options.image = 'fpm';
    options.remoteFiles.vhosts = '/opt/bitnami/extra/nginx/templates/default.conf.tpl';
    options.defaultFiles.vhosts = 'default.conf.tpl';
    if (process.platform === 'win32') {
      options.volumes.push(`${options.confDest}/zz-lando.conf:/usr/local/etc/php-fpm.d/zz-lando.conf`);
    }
    options.remoteFiles.pool = '/usr/local/etc/php-fpm.d/zz-lando.conf';
  // cli
  } else if (options.via === 'cli') {
    options.command = ['tail -f /dev/null'];
  }
  return options;
};


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
    sources: [],
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
      options = parseConfig(_.merge({}, config, options));

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

      if (options.via === 'nginx') {
        const nginxOpts = _.cloneDeep(options);
        nginxOpts.name = `${options.name}nginx`;
        nginxOpts.version = '1.14';
        nginxOpts.supported = ['1.14'];
        nginxOpts.confDest = path.resolve(options.confDest, '..', 'nginx');
        delete nginxOpts.config;
        nginxOpts.config = {
          vhosts: `${options.confDest}/${nginxOpts.defaultFiles.vhosts}`,
        };
        const LandoNginx = factory.get('nginx');
        const nginx = new LandoNginx(nginxOpts.name, nginxOpts);
        nginx.data.push({
          services: _.set({}, nginxOpts.name, {'depends_on': [options.name]}),
        });
        options.sources.push(nginx.data);
      }

      options.sources.push({
        services: _.set({}, options.name, php),
        volumes: _.set({}, 'data', {}),
      });
      super(id, options, ..._.flatten(options.sources));
    };
  },
};
