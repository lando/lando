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
  const scriptsLagoon = path.join(
    lando.config.pluginDirs[0],
    'integrations',
    'lando-lagoon',
    'scripts'
  );
  const scriptLagoonGenerateKey = path.join(scriptsLagoon, 'lagoon-generate-key.sh');
  const scriptLagoonRefreshToken = path.join(scriptsLagoon, 'lagoon-refresh-token.sh');

  const scriptGenerateKey = path.join(
    lando.config.pluginDirs[0],
    'plugins',
    'lando-recipes',
    'scripts',
    'generate-key.sh'
  );

  const scriptLog = path.join(
    lando.config.pluginDirs[0],
    'plugins',
    'lando-core',
    'scripts',
    'log.sh'
  );

  let command = [
    'docker',
    'run',
    '-i',
    '--rm',
    '--name',
    'landolagoonkeygen',
    `-v ${scriptLagoonGenerateKey}:/helpers/lagoon-generate-key.sh`,
    `-v ${scriptLagoonRefreshToken}:/helpers/lagoon-refresh-token.sh`,
    `-v ${scriptGenerateKey}:/helpers/generate-key.sh`,
    `-v ${scriptLog}:/helpers/log.sh`,
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
