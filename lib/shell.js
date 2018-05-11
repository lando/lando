'use strict';

// Modules
var _ = require('lodash');
var _shell = require('shelljs');
var _spawn = require('child_process').spawn;
var _esc = require('shell-escape');
var Log = require('./logger');
var Promise = require('./promise');

// We make this module into a function so we can pass in a logger
module.exports = function(logger) {

  // Set up the logger
  var log = logger || new Log();

  /*
   * Handle the exec func
   */
  var exec = function(cmd, opts) {

    // Merge in our options
    var defaults = {silent: true};
    var options = (opts) ? _.extend(defaults, opts) : defaults;

    // Log
    log.verbose('Running exec %s', cmd);
    log.debug('With env', process.env);

    // Promisify the exec
    return new Promise(function(resolve, reject) {
      _shell.exec(_esc(cmd), options, function(code, stdout, stderr) {
        if (code !== 0) {
          var error = new Error(stderr);
          error.code = code;
          reject(error);
        }
        else {
          resolve(stdout);
        }
      });
    });

  };

  /*
   * Handle the spawn function
   */
  var spawn = function(cmd, opts) {

    // Promisify the spawn
    return new Promise(function(resolve, reject) {

      // Merge provided options with defaults
      var defaults = {stdio: ['pipe', 'pipe', 'pipe']};
      var options = (opts) ? _.extend(defaults, opts) : defaults;

      // Set environment for spawned process.
      options.detached = options.detached || false;

      // Use stdio options and then create the child
      var entrypoint = cmd.shift();

      // Log
      log.verbose('Running spawn %s with args %j', entrypoint, cmd);
      log.debug('In mode %s with detached %s', options.mode, options.detached);
      log.debug('With env', process.env);

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
          var error = new Error(stdErr);
          error.code = code;
          reject(error);
        }
        else {
          resolve(stdOut);
        }
      });

    });
  };

  /**
   * Runs a command.
   *
   * This is an abstraction method that:
   *
   *  1. Delegates to either node's native `spawn` or `exec` methods.
   *  2. Promisifies the calling of these function
   *  3. Handles `stdout`, `stdin` and `stderr`
   *
   * Beyond the options specified below you should be able to pass in known [exec](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
   * or [spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) options depending on whether we have a mode or not.
   *
   * @since 3.0.0
   * @alias 'lando.shell.sh'
   * @see [extra exec options](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
   * @see [extra spawn options](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
   * @param {Array} cmd - The command to run as elements in an array or a string.
   * @param {Object} [opts] - Options to help determine how the exec is run.
   * @param {Boolean} [opts.detached] - Whether we are running in detached mode or not (deprecated)
   * @returns {Promise} A promise with collected results if applicable.
   * @example
   *
   * // Run a command in collect mode
   * return lando.shell.sh(['ls', '-lsa', '/'], {mode: 'collect'})
   *
   * // Catch and log any errors
   * .catch(function(err) {
   *   lando.log.error(err);
   * })
   *
   * // Print the collected results of the command
   * .then(function(results) {
   *   console.log(results);
   * });
   */
  var sh = function(cmd, opts) {

    // Log the command and opts
    log.debug('About to run', cmd);
    log.silly('With pre run opts', opts);

    // If we have a mode or are detached then we need to spawn
    if (opts && (opts.mode || opts.detached === true)) {

      // Hard enforce collect mode if we do not have a terminal context
      if (process.lando !== 'node') { opts.mode = 'collect'; }

      // Stdio based on process context
      var stdinMode = (process.lando !== 'node') ? 'ignore' : process.stdin;
      var stdErrMode = (process.lando !== 'node') ? 'ignore' : process.stderr;

      // Determine attach and collect stdio
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
   * Escapes any spaces in a command.
   *
   * @since 3.0.0
   * @alias 'lando.shell.escSpaces'
   * @param {Array} s - A command as elements of an Array or a String.
   * @return {String} The space escaped cmd.
   * @example
   *
   * // Escape the spaces in the cmd
   * var escapedCmd = lando.shell.escSpaces(['git', 'commit', '-m', 'my message']);
   */
  var escSpaces = function(s, platform) {

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
   * Escapes special characters in a command to make it more exec friendly.
   *
   * @since 3.0.0
   * @function
   * @alias 'lando.shell.esc'
   * @param {Array} cmd - A command as elements of an Array or a String.
   * @return {String} The escaped cmd.
   * @example
   *
   * // Escape the cmd
   * var escapedCmd = lando.shell.esc(['git', 'commit', '-m', 'my message']);
   */
  var esc = _esc;

  /**
   * Returns the path of a specific command or binary.
   *
   * @since 3.0.0
   * @function
   * @alias 'lando.shell.which'
   * @param {String} cmd - A command to search for.
   * @return {String|undefined} The path to the command or `undefined`.
   * @example
   *
   * // Determine the location of the 'docker' command
   * var which = lando.shell.which(DOCKER_EXECUTABLE);
   */
  var which = _shell.which;

  // Return
  return {
    exec: exec,
    sh: sh,
    escSpaces: escSpaces,
    esc: esc,
    which: which
  };

};
