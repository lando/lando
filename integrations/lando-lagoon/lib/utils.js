'use strict';
const path = require('path');

exports.run = (lando, cmd, key = null, silent = true, image='devwithlando/util') => {
  const scriptsDir = path.join(lando.config.userConfRoot, 'scripts');

  let command = [
    'docker',
    'run',
    '--interactive',
    '--rm',
    '-v',
    `${scriptsDir}:/helpers`,
    '-v',
    `${lando.config.userConfRoot}:/lando`,
  ];

  // Mount the key if we have one
  if (key) command = command.concat(['-v', `${key}:/key`]);
  // Add the Docker image.
  command.push(image);
  // Support cmd input as string or array.
  if (typeof cmd === 'string')cmd = cmd.split(' ');
  // Finish it
  command = command.concat(cmd);

  // Log
  lando.log.verbose('Running command: %s', command.join(' '));
  // Run
  return lando.shell.sh(command, {mode: 'attach', silent, cstdio: ['ignore', 'pipe', 'pipe']});
};
