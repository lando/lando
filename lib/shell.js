/**
 * Shell module
 *
 * @name shell
 */

'use strict';

// Modules
var _ = require('./node')._;
var _shell = require('shelljs');
var _spawn = require('child_process').spawn;
var config = require('./config');
var esc = require('shell-escape');
var log = require('./logger');
var Promise = require('./promise');

/**
 * Get an env object to inject into child process.
 */
function getEnvironment(opts) {
  return (opts.app) ? _.merge(config.env, {}) : config.env;
}

/*
 * Troll stdout for app status messages.
 */
function trollStdout(opts, msg) {
  var app = _.get(opts, 'app');
  if (app && msg) {
    app.trollForStatus(msg);
  }
}

/*
 * Handle the exec func
 */
var exec = function(cmd, opts) {

  // Merge in our options
  var defaults = {silent: true};
  var options = (opts) ? _.extend(defaults, opts) : defaults;

  // Set environment for spawned process.
  options.env = getEnvironment(options);

  // Log
  log.verbose('Running exec %s', cmd);
  log.debug('With env', options.env);

  // Promisify the exec
  return new Promise(function(resolve, reject) {
    _shell.exec(esc(cmd), options, function(code, stdout, stderr) {
      if (code !== 0) {
        reject(new Error(code, stdout, stderr));
      }
      else {
        resolve(stdout);
      }
    });
  });

};

/**
 * Handle the spawn function
 */
var spawn = function(cmd, opts) {

  // Promisify the spawn
  return new Promise(function(resolve, reject) {

    // Merge provided options with defaults
    var defaults = {stdio: ['pipe', 'pipe', 'pipe']};
    var options = (opts) ? _.extend(defaults, opts) : defaults;

    // Set environment for spawned process.
    options.env = getEnvironment(opts);
    options.detached = options.detached || false;

    // Use stdio options and then create the child
    var entrypoint = cmd.shift();

    // Log
    log.verbose('Running spawn %s with args %j', entrypoint, cmd);
    log.debug('In mode %s with detached %s', options.mode, options.detached);
    log.debug('With env', options.env);

    // Run the spawn
    var run = _spawn(entrypoint, cmd, options);

    // Auto-resolve if we are not connected
    if (options.detached === true && run.connected === false) {
      resolve(true);
    }

    // Collector for buffer
    var stdOut = '';
    var stdErr = '';

    // Collect data if stdout is being piped
    if (options.stdio === 'pipe' || options.stdio[1] === 'pipe') {
      run.stdout.on('data', function(buffer) {
        log.debug('Collected output: %s', _.trim(String(buffer)));
        stdOut = stdOut + String(buffer);
        trollStdout(options, _.trim(String(buffer)));
      });
    }

    // Collect stderr
    run.on('error', function(buffer) {
      log.debug('Collected error: %s', _.trim(String(buffer)));
      stdErr = stdErr + String(buffer);
    });

    // Callback when done
    run.on('close', function(code) {
      log.verbose('Spawn exited with code: %s', code);
      log.silly('Spawn finished with', stdOut, stdErr);
      if (code !== 0) {
        reject(new Error(code, stdOut, stdErr));
      }
      else {
        resolve(stdOut);
      }
    });

  });
};

/**
 * Escapes the spaces in an array or string into a string to make it more CLI friendly
 * @arg {string|Array} command - The command to run.
 */
exports.escSpaces = function(s, platform) {

  var p = platform || process.platform;

  if (_.isArray(s)) {
    s = s.join(' ');
  }
  if (p === 'win32') {
    return s.replace(/ /g, '^ ');
  }
  else {
    return s.replace(/ /g, '\ ');
  }
};

/**
 * Exec or spawn a shell command.
 */
exports.sh = function(cmd, opts) {

  // Log the command and opts
  log.debug('About to run', cmd);
  log.silly('With pre run opts', opts);

  // If we have a mode or are detached then we need to spawn
  if (opts && (opts.mode || opts.detached === true)) {

    // Stdio per mode
    var stdinMode = (config.mode === 'gui') ? 'ignore' : process.stdin;
    var stdErrMode = (config.mode === 'gui') ? 'ignore' : process.stderr;

    // Attach and collect modes
    var collect = {stdio: [stdinMode, 'pipe', stdErrMode]};
    var attach = {stdio: 'inherit'};
    var stdio = (opts.mode === 'attach') ? attach : collect;

    // Merge in our options
    var options = (opts) ? _.extend(opts, stdio) : stdio;

    return spawn(cmd, options);
  }

  // Otherwise we can do a basic exec
  else {
    return exec(cmd, opts);
  }

};

/**
 * Escapes an array or string into a string to make it more CLI friendly
 * @arg {string|Array} command - The command to run.
 */
exports.esc = esc;

/**
 * Do a which
 */
exports.which = _shell.which;
