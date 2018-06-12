'use strict';

// Modules
const _ = require('lodash');
const _shell = require('shelljs');
const child = require('child_process');
const _esc = require('shell-escape');
const Log = require('./logger');
const Promise = require('./promise');

/*
 * Helper to collect and print buffer
 */
const bufferMe = buffer => {
  console.log(_.trim(String(buffer)));
  return String(buffer);
};

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
  const run = child.spawn(_.first(cmd), _.tail(cmd), opts);
  return new Promise(resolve => {
    // Auto-resolve if we are not connected
    // @todo: is this even something we support anymore?
    if (opts.detached === true && run.connected === false) resolve({code: 0, stdout, stderr});

    // Collect STDout if we can
    if (opts.stdio === 'pipe' || opts.stdio[1] === 'pipe') {
      run.stdout.on('data', buffer => {
        stdout = stdout + bufferMe(buffer);
      });
    }
    run.on('error', buffer => {
      stderr = stderr + bufferMe(buffer);
    });
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
   * @since 3.0.0
   * @alias lando.shell.sh
   * @see [extra exec options](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
   * @see [extra spawn options](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
   * @param {Array} cmd The command to run as elements in an array.
   * @param {Object} [opts] Options to help determine how the exec is run.
   * @param {Boolean} [opts.mode='exec'] The mode to run in
   * @param {Boolean} [opts.detached=false] Whether we are running in detached mode or not (deprecated)
   * @param {Boolean} [opts.app={}] A Lando app object
   * @param {Boolean} [opts.cwd=process.cwd()] The directory to run the command from
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
  sh(cmd, {mode = 'exec', detached = false, app = {}, cwd = process.cwd()} = {}) {
    // Log more because this shit important!
    this.log.verbose('Running %j in %s with options %j', cmd, cwd, {mode, detached});
    this.log.silly('With env %j', process.env);

    // Promise it
    return Promise.try(() => {
      // Immediately exec if we can
      if (mode === 'exec' && detached === false) {
        return exec(cmd, _.merge({}, {silent: true}, {app, cwd, detached, mode}));
      }

      // For collect mode on non-node
      if (process.lando !== 'node') mode = 'collect';

      // Determine attach and collect stdio
      // This only matters for non=execs
      const stdinMode = (process.lando !== 'node') ? 'ignore' : process.stdin;
      const stdErrMode = (process.lando !== 'node') ? 'ignore' : process.stderr;
      const stdio = (mode === 'attach') ? {stdio: 'inherit'} : {stdio: [stdinMode, 'pipe', stdErrMode]};

      // Log the extra things
      this.log.debug('With stdio=%j, mode=%s, detached=%s', stdio, mode, detached);
      return spawn(cmd, _.merge({}, {app, cwd, detached, mode}, stdio));
    })

    // Assess the results
    .then(({code, stdout, stderr}) => {
      this.log.verbose('%s finished with code %s', cmd, code);
      return (code !== 0) ? Promise.reject(new Error(stderr)) : Promise.resolve(stdout);
    });
  };

  /**
   * Escapes any spaces in a command.
   *
   * @since 3.0.0
   * @alias lando.shell.escSpaces
   * @param {Array|String} s A command as elements of an Array or a String.
   * @param {String} platform Specify a platform to escape for
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
   * @param {Array} cmd A command as elements of an Array.
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
   * @param {String} cmd A command to search for.
   * @return {String|null} The path to the command or null.
   * @example
   * // Determine the location of the 'docker' command
   * const which = lando.shell.which(DOCKER_EXECUTABLE);
   */
  which(cmd) {
    return _shell.which(cmd);
  };
};
