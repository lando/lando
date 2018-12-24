'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

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

/*
 * Helper to get a phar download and setupcommand
 * @TODO: clean this mess up
 */
exports.getPhar = (url, src, dest, check) => {
  // Status checker
  let statusCheck = check || 'true';
  // Arrayify the check if needed
  if (_.isString(statusCheck)) statusCheck = [statusCheck];
  // Phar install command
  const pharInstall = [
    ['curl', url, '-L', '-o', src],
    ['chmod', '+x', src],
    statusCheck,
    ['mv', src, dest],
  ];
  // Return
  return _.map(pharInstall, cmd => {
    return cmd.join(' ');
  }).join(' && ');
};

/*
 * Helper to get simple lamp/lemp config defaultz
 * NOTE: is it problem that this and lemp has the same class name?
 */
exports.getLampDefaults = (name = 'lamp', via = 'apache', proxyService = 'appserver') => ({
  name,
  parent: '_lamp',
  config: {
    composer: {},
    confSrc: __dirname,
    config: {},
    database: 'mysql',
    php: '7.2',
    services: {},
    tooling: {},
    via,
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoLamp extends parent {
    constructor(id, options = {}) {
      options.proxy = _.set({}, proxyService, [`${options.app}.${options._app._config.domain}`]);
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
