'use strict';
const path = require('path');
const build = require('../../../plugins/lando-recipes/lib/build');
const Shell = require('../../../lib/shell');

exports.landoRun = (lando, cmd) => {
  const options = {name: 'landoinit', destination: '/tmp'};
  const config = build.runDefaults(lando, options);
  config.cmd = cmd;
  return build.run(lando, build.buildRun(config));
};

exports.run = (lando, cmd, opts = null, image='devwithlando/util') => {
  const scriptsDir = path.join(lando.config.userConfRoot, 'scripts');

  let command = [
    'docker',
    'run',
    '-i',
    '--rm',
    '--name',
    'landolagoonkeygen',
    `-v ${scriptsDir}:/helpers`,
    `-v ${lando.config.userConfRoot}:/lando`,
  ];

  // Add additional options passed in.
  if (opts !== null) {
    command = command.concat(opts);
  }
  // Add the Docker image.
  command.push(image);

  // Support cmd input as string or array.
  if (typeof cmd === 'string') {
    cmd = cmd.split(' ');
  }
  command = command.concat(cmd);

  lando.log.verbose('Running command: %s', command.join(' '));

  const shell = new Shell(lando.log);
  return shell.sh(command);
};
