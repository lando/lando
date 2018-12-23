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

  const getCgr = (pkg, version) => {
    // Add version if needed
    if (!_.isEmpty(version)) {
      pkg = [pkg, version].join(':');
    }

    // Start the collector
    const cgr = [
      'composer',
      'global',
      'require',
      pkg,
    ];

    // Return the whole shebang
    return cgr.join(' ');
  };

  const getPhar = (url, src, dest, check) => {
    // Status checker
    let statusCheck = check || 'true';

    // Arrayify the check if needed
    if (_.isString(statusCheck)) {
      statusCheck = [statusCheck];
    }

    // Phar install command
    const pharInstall = [
      ['cd', '/tmp'],
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
*/
