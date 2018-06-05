'use strict';

// Modules
const _ = require('lodash');
const _shell = require('shelljs');
const _spawn = require('child_process').spawn;
const _esc = require('shell-escape');
const Log = require('./logger');
const Promise = require('./promise');

// We make this module into a function so we can pass in a logger
module.exports = (log = new Log()) => {
  /*
   * Handle the exec func
   */
  const exec = (cmd, opts = {}) => {
    // Log
    log.verbose('Running exec %s', cmd);
    log.debug('With env', process.env);

    // Promisify the exec
    return new Promise((resolve, reject) => {
      _shell.exec(_esc(cmd), _.merge({silent: true}, opts), (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          error.code = code;
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  };

  /*
   * Handle the spawn function
   * // @todo: better default opts handling
   */
  const spawn = (cmd, opts) => new Promise((resolve, reject) => {
    // Merge provided options with defaults
    const defaults = {stdio: ['pipe', 'pipe', 'pipe']};
    const options = (opts) ? _.extend(defaults, opts) : defaults;

    // Set environment for spawned process.
    options.detached = options.detached || false;

    // Use stdio options and then create the child
    const entrypoint = cmd.shift();

    // Log
    log.verbose('Running spawn %s with args %j', entrypoint, cmd);
    log.debug('In mode %s with detached %s', options.mode, options.detached);
    log.debug('With env', process.env);

    // Run the spawn
    const run = _spawn(entrypoint, cmd, options);

    // Auto-resolve if we are not connected
    if (options.detached === true && run.connected === false) resolve(true);

    // Collector for buffer
    const stdOut = '';
    const stdErr = '';

    // Collect data if stdout is being piped
    if (options.stdio === 'pipe' || options.stdio[1] === 'pipe') {
      run.stdout.on('data', buffer => {
        log.debug('Collected output: %s', _.trim(String(buffer)));
        stdOut = stdOut + String(buffer);
      });
    }

    // Collect stderr
    run.on('error', buffer => {
      log.debug('Collected error: %s', _.trim(String(buffer)));
      stdErr = stdErr + String(buffer);
    });

    // Callback when done
    run.on('close', code => {
      log.verbose('Spawn exited with code: %s', code);
      log.silly('Spawn finished with', stdOut, stdErr);
      if (code !== 0) {
        const error = new Error(stdErr);
        error.code = code;
        reject(error);
      } else {
        resolve(stdOut);
      }
    });
  });

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
   * @alias lando.shell.sh
   * @see [extra exec options](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
   * @see [extra spawn options](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
   * @param {Array} cmd The command to run as elements in an array or a string.
   * @param {Object} [opts] Options to help determine how the exec is run.
   * @param {Boolean} [opts.detached] Whether we are running in detached mode or not (deprecated)
   * @return {Promise} A promise with collected results if applicable.
   * @example
   * // Run a command in collect mode
   * return lando.shell.sh(['ls', '-lsa', '/'], {mode: 'collect'})
   *
   * // Catch and log any errors
   * .catch(err => {
   *   lando.log.error(err);
   * })
   *
   * // Print the collected results of the command
   * .then(results => {
   *   console.log(results);
   * });
   */
  const sh = (cmd, opts) => {
    // Log the command and opts
    log.debug('About to run', cmd);
    log.silly('With pre run opts', opts);
    // If we have a mode or are detached then we need to spawn
    if (opts && (opts.mode || opts.detached === true)) {
      // Hard enforce collect mode if we do not have a terminal context
      if (process.lando !== 'node') opts.mode = 'collect';
      // Stdio based on process context
      const stdinMode = (process.lando !== 'node') ? 'ignore' : process.stdin;
      const stdErrMode = (process.lando !== 'node') ? 'ignore' : process.stderr;
      // Determine attach and collect stdio
      const collect = {stdio: [stdinMode, 'pipe', stdErrMode]};
      const attach = {stdio: 'inherit'};
      const stdio = (opts.mode === 'attach') ? attach : collect;
      // Merge in our options
      const options = (opts) ? _.extend(opts, stdio) : stdio;
      return spawn(cmd, options);
    } else {
      return exec(cmd, opts);
    }
  };

  /**
   * Escapes any spaces in a command.
   *
   * @since 3.0.0
   * @alias lando.shell.escSpaces
   * @param {Array} s A command as elements of an Array or a String.
   * @param {String} platform Specify a platform to escape with
   * @return {String} The space escaped cmd.
   * @example
   * // Escape the spaces in the cmd
   * const escapedCmd = lando.shell.escSpaces(['git', 'commit', '-m', 'my message']);
   */
  const escSpaces = (s, platform = process.platform) => {
    if (_.isArray(s)) s = s.join(' ');
    return (platform === 'win32') ? s.replace(/ /g, '^ ') : s.replace(/ /g, '\ ');
  };

  /**
   * Escapes special characters in a command to make it more exec friendly.
   *
   * @since 3.0.0
   * @function
   * @alias lando.shell.esc
   * @param {Array} cmd A command as elements of an Array or a String.
   * @return {String} The escaped cmd.
   * @example
   * // Escape the cmd
   * const escapedCmd = lando.shell.esc(['git', 'commit', '-m', 'my message']);
   */
  const esc = _esc;

  /**
   * Returns the path of a specific command or binary.
   *
   * @since 3.0.0
   * @function
   * @alias lando.shell.which
   * @param {String} cmd - A command to search for.
   * @return {String|undefined} The path to the command or `undefined`.
   * @example
   * // Determine the location of the 'docker' command
   * const which = lando.shell.which(DOCKER_EXECUTABLE);
   */
  const which = _shell.which;

  // Return
  return {
    exec: exec,
    sh: sh,
    escSpaces: escSpaces,
    esc: esc,
    which: which,
  };
};
