'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * Helper to get DRUSH phar url
 */
const getDrushUrl = version => `https://github.com/drush-ops/drush/releases/download/${version}/drush.phar`;

/*
 * Helper to get the phar build command
 */
exports.getDrush = (version, status) => exports.getPhar(
  getDrushUrl(version),
  '/tmp/drush.phar',
  '/usr/local/bin/drush',
  status
);

/*
 * Helper to get a phar download and setupcommand
 * @TODO: clean this mess up
 */
exports.getPhar = (url, src, dest, check = 'true') => {
  // Arrayify the check if needed
  if (_.isString(check)) check = [check];
  // Phar install command
  const pharInstall = [
    ['curl', url, '-L', '-o', src],
    ['chmod', '+x', src],
    check,
    ['mv', src, dest],
  ];
  // Return
  return _.map(pharInstall, cmd => cmd.join(' ')).join(' && ');
};

/*
 * Helper to get simple lamp/lemp config defaultz
 * NOTE: is it problem that this and lemp has the same class name?
 */
exports.getLampDefaults = (name = 'lamp', via = 'apache') => ({
  name,
  parent: '_lamp',
  config: {
    confSrc: __dirname,
    database: 'mysql',
    php: '7.2',
    via,
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoLamp extends parent {
    constructor(id, options = {}) {
      super(id, _.merge({}, config, options));
    };
  },
});

/*
 * Helper to get service config
 */
exports.getServiceConfig = (options, types = ['php', 'vhosts']) => {
  const config = {};
  _.forEach(types, type => {
    if (_.has(options, `config.${type}`)) {
      config[type] = options.config[type];
    } else if (!_.has(options, `config.${type}`) && _.has(options, `defaultFiles.${type}`)) {
      config[type] = path.join(options.confDest, options.defaultFiles[type]);
    }
  });
  return config;
};

/*
 * Parse config into raw materials for our factory
 */
exports.parseConfig = (recipe, app) => _.merge({}, _.get(app, 'config.config', {}), {
  _app: app,
  app: app.name,
  confDest: path.join(app._config.userConfRoot, 'config', recipe),
  home: app._config.home,
  project: app.project,
  recipe,
  root: app.root,
  userConfRoot: app._config.userConfRoot,
});
