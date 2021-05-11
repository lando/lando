'use strict';

const _ = require('lodash');
const path = require('path');

/*
 * Returns the target OS
 */
exports.cliTargetOs = () => {
  switch (process.platform) {
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'linux';
    case 'win32':
      return 'win';
    default:
      return 'linux';
  }
};

/*
 * Constructs the CLI PKG task
 */
exports.cliPkgTask = (output, arch = 'x64') => {
  // Package command
  const pkgCmd = [
    'node',
    path.resolve(__dirname, '..', 'node_modules', 'pkg', 'lib-es5', 'bin.js'),
    '--targets ' + ['node12', exports.cliTargetOs(), arch].join('-'),
    '--config ' + path.join('package.json'),
    '--output ' + output,
    path.join('bin', 'lando.js'),
  ];

  // Start to build the command
  const cmd = [];
  cmd.push('yarn install --production');
  cmd.push(pkgCmd.join(' '));

  // Add executable perms on POSIX
  if (process.platform !== 'win32') {
    cmd.push('chmod +x ' + output);
    cmd.push('sleep 2');
  }

  // Return the CLI build task
  return cmd;
};

/*
 * Fixes a jsdoc2md alias
 */
exports.fixAlias = datum => {
  const needsWrapping = s => !_.startsWith(s, '\'') && !_.endsWith(s, '\'') && _.includes(s, 'lando.');
  if (_.has(datum, 'alias') && needsWrapping(datum.alias)) {
    if (_.startsWith(datum.alias, 'lando.')) {
      datum.name = datum.alias;
      datum.kind = 'function';
      datum.scope = 'global';
      delete datum.memberof;
    }
  }
  return datum;
};

/*
 * Fixes a jsdoc2md alias
 */
exports.parseCommand = (cmd, cwd = path.resolve(__dirname, '..')) => {
  const mode = (process.platform === 'win32') ? {} : {mode: 'collect'};
  return {run: cmd.split(' '), opts: _.merge({}, {cwd}, mode)};
};

/*
 * Run a ps script
 */
exports.psTask = cmd => (['PowerShell -NoProfile -ExecutionPolicy Bypass -Command', cmd, '&& EXIT /B %errorlevel%']);

/*
 * Installer pacakge task
 */
exports.installerPkgTask = (arch = 'amd64') => {
  const extension = (process.platform === 'win32') ? 'ps1' : 'sh';
  const join = (extension === 'sh') ? path.posix.join : path.win32.join;
  const script = join('scripts', `build-${process.platform}.${extension} --arch=${arch}`);
  return (extension === 'ps1') ? exports.psTask(script).join(' ') : script;
};
