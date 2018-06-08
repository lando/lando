'use strict';

// Modules
const _ = require('lodash');
const _shell = require('shelljs');
const _spawn = require('child_process').spawn;
const _esc = require('shell-escape');
const Log = require('./logger');
const Promise = require('./promise');

/*
 * Helper to promisify the exec
 */
const exec = (cmd, opts) => {
  return new Promise(resolve => {
    _shell.exec(_esc(cmd), opts, (code, stdout, stderr) => {
      resolve({code, stdout, stderr});
    });
  });
};

/*
 * Handle the spawn function
 */
const spawn = (cmd, opts, stdout = '', stderr = '') => {
  // Run the spawn
  const run = _spawn(_.first(cmd), _.tail(cmd), opts);

  // Promise
  return new Promise(resolve => {
    // Auto-resolve if we are not connected
    // @todo: is this even something we support anymore?
    if (opts.detached === true && run.connected === false) resolve(true);

    // Collect data if stdout is being piped
    if (opts.stdio === 'pipe' || opts.stdio[1] === 'pipe') {
      run.stdout.on('data', buffer => {
        console.log(_.trim(String(buffer)));
        stdout = stdout + String(buffer);
      });
    }

    // Collect stderr
    run.on('error', buffer => {
      console.log('Collected error: %s', _.trim(String(buffer)));
      stderr = stderr + String(buffer);
    });

    // Callback when done
    run.on('close', code => {
      resolve({code, stdout, stderr});
    });
  });
};

// We make this module into a function so we can pass in a logger
module.exports = class Shell {
  constructor(log = new Log()) {
    this.log = log;
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
   * @alias lando.shell.sh
   * @see [extra exec options](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
   * @see [extra spawn options](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
   * @param {Array} cmd The command to run as elements in an array or a string.
   * @param {Object} [opts] Options to help determine how the exec is run.
   * @param {Boolean} [opts.detached] Whether we are running in detached mode or not (deprecated)
   * @param {Array} [stdio] DONT TOUCH IT
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
  sh(cmd, opts = {}, stdio = ['pipe', 'pipe', 'pipe']) {
    // Handle some options if we have a mode eg we anticipate spawning
    if (opts.mode || opts.detached === true) {
      // Hard enforce collect mode if we do not have a terminal context
      if (process.lando !== 'node') opts.mode = 'collect';
      // Stdio based on process context
      const stdinMode = (process.lando !== 'node') ? 'ignore' : process.stdin;
      const stdErrMode = (process.lando !== 'node') ? 'ignore' : process.stderr;
      // Determine attach and collect stdio
      stdio = (opts.mode === 'attach') ? {stdio: 'inherit'} : {stdio: [stdinMode, 'pipe', stdErrMode]};
    }

    // Log more because this shit important!
    this.log.verbose('Running %j with options %j', cmd);
    this.log.debug('With stdio=%j, mode=%s, detacher=%s', stdio, opts.mode, opts.detached);
    this.log.silly('With env %j', process.env);
    this.log.silly('With optsions %j', opts);

    // DO IT!
    return Promise.try(() => {
      if (opts.mode || opts.detached === true) {
        return spawn(cmd, _.merge({}, opts, stdio));
      } else {
        return exec(cmd, _.merge({}, {silent: true}, opts));
      }
    })

    // Assess the results
    .then(({code, stdout, stderr}) => {
      if (code !== 0) {
        const error = new Error(stderr);
        error.code = code;
        return Promise.reject(error);
      } else {
        return Promise.resolve(stdout);
      }
    });
  };

  /**
   * Escapes any spaces in a command.
   *
   * @since 3.0.0
   * @alias lando.shell.escSpaces
   * @param {Array|String} s A command as elements of an Array or a String.
   * @param {String} platform Specify a platform to escape with
   * @return {String} The space escaped cmd.
   * @example
   * // Escape the spaces in the cmd
   * const escapedCmd = lando.shell.escSpaces(['git', 'commit', '-m', 'my message']);
   */
  escSpaces(s, platform = process.platform) {
    if (_.isArray(s)) s = s.join(' ');
    return (platform === 'win32') ? s.replace(/ /g, '^ ') : s.replace(/ /g, '\ ');
  };

  /**
   * Escapes special characters in a command to make it more exec friendly.
   *
   * @since 3.0.0
   * @function
   * @alias lando.shell.esc
   * @param {Array|String} cmd A command as elements of an Array or a String.
   * @return {String} The escaped cmd.
   * @example
   * // Escape the cmd
   * const escapedCmd = lando.shell.esc(['git', 'commit', '-m', 'my message']);
   */
  esc(cmd) {
    return _esc(cmd);
  };

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
  which(cmd) {
    return _shell.which(cmd);
  };
};
