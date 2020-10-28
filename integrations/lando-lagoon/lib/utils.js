'use strict';

const build = require('../../../plugins/lando-recipes/lib/build');
const Shell = require('../../../lib/shell');

exports.run = (cmd, lando) => {
  const shell = new Shell(lando.log);
  return shell.sh(cmd);
};

exports.landoRun = (lando, cmd) => {
  const options = {name: 'landoinit', destination: '/tmp'};
  const config = build.runDefaults(lando, options);
  config.cmd = cmd;
  return build.run(lando, build.buildRun(config));
};
