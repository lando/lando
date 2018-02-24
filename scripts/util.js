'use strict';

const child = require('child_process');
const semver = require('semver');

module.exports = {

  /**
   * Helper to run Git Comamnds
   * @see https://github.com/pankajladhar/run-git-command/blob/master/index.js
   * @param args
   * @param customMsg
   */
  execGitCmd: function(args, customMsg) {
    console.log(customMsg);
    return child.spawnSync('git', args, {stdio: [0, 'pipe', 'pipe'], encoding: 'utf8'}).stdout;
  },

  /**
   * The platform normalize for pkg
   */
  platform: (process.platform !== 'darwin') ? process.platform : 'osx',

  /*
   * Run a ps script
   */
  psTask: function(cmd) {

    // "Constants"
    var shellOpts = {execOptions: {maxBuffer: 20 * 1024 * 1024}};
    var entrypoint = 'PowerShell -NoProfile -ExecutionPolicy Bypass -Command';

    // Return our ps task
    return {
      options: shellOpts,
      command: [entrypoint, cmd, '&& EXIT /B %errorlevel%'].join(' ')
    };

  },

  /**
   * Bump the Version of a Package.json given a json object and stage.
   *
   * @param {Object} pkgJson Package.json file as a loaded object.
   * @param {String} stage The release stage.
   * @returns {String} New version number.
   */
  setVersion: function(pkgJson, stage) {
    const current = pkgJson.version;
    switch (stage) {
      case 'prerelease':
        return semver.inc(current, 'prerelease');
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
  scriptTask: function(cmd) {

    // "Constants"
    var shellOpts = {execOptions: {maxBuffer: 20 * 1024 * 1024}};

    // Return our shell task
    return {
      options: shellOpts,
      command: cmd
    };

  },

  shellExec: function(data) {
    const opts = {
      stdout: true,
      stderr: true,
      stdin: true,
      failOnError: true,
      stdinRawMode: false,
      preferLocal: true,
      execOptions: {
        env: data.options.execOptions.env || process.env
      }
    };

    const cmd = typeof data === 'string' ? data : data.command;

    if (cmd === undefined) {
      throw new Error('`command` required');
    }

    opts.execOptions = Object.assign(data.options, opts.execOptions);
    const promiseFromChild = function(child) {
      return new Promise(function(resolve, reject) {
        child.addListener('error', reject);
        child.addListener('exit', resolve);
      });
    };

    const cp = child.exec(cmd, opts.execOptions);

    cp.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });
    cp.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    return promiseFromChild(cp).then(function (result) {
      console.log('promise complete: ' + result);
    }, function (err) {
      console.log('promise rejected: ' + err);
    });

  }
};
