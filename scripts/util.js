'use strict';

const child = require('child_process');
const Promise = require('bluebird');
const semver = require('semver');

module.exports = {

  /*
   * Helper to run Git Comamnds
   * @see https://github.com/pankajladhar/run-git-command/blob/master/index.js
   * @param args
   * @param customMsg
   */
  execGitCmd: (args, customMsg) => {
    console.log(customMsg);
    return child.spawnSync('git', args, {stdio: [0, 'pipe', 'pipe'], encoding: 'utf8'}).stdout;
  },

  /*
   * The platform normalize for pkg
   */
  platform: (process.platform !== 'darwin') ? process.platform : 'osx',

  /*
   * Run a ps script
   */
  psTask: cmd => {
    return {
      options: {execOptions: {maxBuffer: 20 * 1024 * 1024}},
      command: ['PowerShell -NoProfile -ExecutionPolicy Bypass -Command', cmd, '&& EXIT /B %errorlevel%'].join(' '),
    };
  },

  /*
   * Bump the Version of a Package.json given a json object and stage.
   *
   * @param {Object} pkgJson Package.json file as a loaded object.
   * @param {String} stage The release stage.
   * @returns {String} New version number.
   */
  setVersion: (pkgJson, stage) => {
    const current = pkgJson.version;
    switch (stage) {
      case 'prerelease':
        return semver.inc(current, 'prerelease', 'beta');
      case 'patch':
        return semver.inc(current, 'patch');
      case 'minor':
        return semver.inc(current, 'minor');
      case 'major':
        return semver.inc(current, 'major');
      default:
        return semver.inc(current, stage);
    }
  },

  /*
   * Run a default bash/sh/cmd script
   */
  scriptTask: cmd => {
    return {
      options: {execOptions: {maxBuffer: 20 * 1024 * 1024}},
      command: cmd,
    };
  },

  /*
   * This does something?
   * @todo: Dustin?
   */
  shellExec: data => {
    const opts = {
      stdout: true,
      stderr: true,
      stdin: true,
      failOnError: true,
      stdinRawMode: false,
      preferLocal: true,
      execOptions: {
        env: data.options.execOptions.env || process.env,
      },
    };

    const cmd = typeof data === 'string' ? data : data.command;

    if (cmd === undefined) throw new Error('`command` required');

    opts.execOptions = Object.assign(data.options, opts.execOptions);
    const promiseFromChild = child => {
      return new Promise((resolve, reject) => {
        child.addListener('error', reject);
        child.addListener('exit', resolve);
      });
    };

    const cp = child.exec(cmd, opts.execOptions);

    cp.stdout.on('data', data => {
      console.log('stdout: ' + data);
    });
    cp.stderr.on('data', data => {
      console.log('stderr: ' + data);
    });

    return promiseFromChild(cp)
    .then(result => {
      console.log('promise complete: ' + result);
    }, err => {
      console.log('promise rejected: ' + err);
    });
  },
};
