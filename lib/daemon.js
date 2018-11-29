'use strict';

// Modules
const _ = require('lodash');
const Cache = require('./cache');
const env = require('./env');
const Events = require('./events');
const Log = require('./logger');
const Promise = require('./promise');
const Shell = require('./shell');
const shell = new Shell();

/*
 * Get services wrapper
 */
const buildDockerCmd = cmd => {
  switch (process.platform) {
    case 'darwin':
      return ['open', '/Applications/Docker.app'];
    case 'linux':
      if (_.includes(_.toString(shell.which('systemctl')), 'systemctl')) {
        return ['sudo', 'systemctl', cmd, 'docker'];
      } else {
        return ['sudo', 'service', 'docker'].concat(cmd);
      }
    case 'win32':
      const base = process.env.ProgramW6432 || process.env.ProgramFiles;
      const dockerBin = base + '\\Docker\\Docker\\Docker for Windows.exe';
      return ['cmd', '/C', dockerBin];
  }
};

/*
 * Creates a new Daemon instance.
 */
module.exports = class LandoDaemon {
  constructor(
      cache = new Cache(),
      events = new Events(),
      docker = env.getDockerExecutable(),
      log = new Log(),
      context = 'node'
  ) {
    this.cache = cache;
    this.docker = docker;
    this.events = events;
    this.log = log;
    this.context = context;
  };

  /*
   * Tries to active the docker engine/daemon.
   *
   * @since 3.0.0
   * @fires pre_engine_up
   * @fires post_engine_up
   * @return {Promise} A Promise.
   */
  up() {
    const self = this;
    /*
     * Not officially documented event that allows you to do some things before
     * the docker engine is booted up.
     *
     * @since 3.0.0
     * @event pre_engine_up
     */
    return self.events.emit('pre-engine-up')
    .then(() => {
      // Automatically return true if we are in the GUI and on linux because
      // this requires SUDO and because the daemon should always be running on nix
      if (self.context !== 'node' && process.platform === 'linux') return Promise.resolve(true);
      // Turn it on if we can
      return this.isUp(self.log, self.cache, self.docker).then(isUp => {
        if (!isUp) {
          self.log.warn('Whoops! Lando has detected that Docker is not turned on!');
          self.log.warn('Give us a few moments while we try to start it up for you');
          return shell.sh(buildDockerCmd('start'))
          // Likely need to retry until start command completes all good
          .retry(() => {
            self.log.warn('Docker has started but we are waiting for a connection');
            self.log.warn('You should be good to go momentarily!');
            return shell.sh([self.docker, 'info'], {mode: 'collect'});
          }, {max: 25, backoff: 1000})
          // Engine is good!
          .then(self.log.info('Engine activated.'))
          // Fail if retry is no good
          .catch(err => {
            throw new Error(err, 'Error bringing daemon up.');
          });
        }
      });
    })

    /*
     * Not officially documented event that allows you to do some things after
     * the docker engine is booted up.
     *
     * @since 3.0.0
     * @event post_engine_up
     */
    .then(() => self.events.emit('post-engine-up'));
  };

  down() {
    const self = this;
    /*
     * Event that allows you to do some things after the docker engine is booted
     * up.
     *
     * @since 3.0.0
     * @event pre_engine_down
     */
    return self.events.emit('pre-engine-down')
    .then(() => {
      // Automatically return true if we are in browsery context and on linux because
      // this requires SUDO and because the daemon should always be running on nix
      if (self.context !== 'node' && process.platform === 'linux') return Promise.resolve(true);
      // Automatically return if we are on Windows or Darwin because we don't
      // ever want to automatically turn the VM off since users might be using
      // D4M/W for other things.
      //
      // For now we will be shutting down any services via relevant event hooks
      // that bind to critical/common ports on 127.0.0.1/localhost e.g. 80/443/53
      //
      // @todo: When/if we can run our own isolated docker daemon we can change
      // this back.
      if (process.platform === 'win32' || process.platform === 'darwin') return Promise.resolve(true);
      // Shut provider down if its status is running.
      return this.isUp(self.log, self.cache, self.docker).then(isUp => {
        if (isUp) return shell.sh(buildDockerCmd('stop'), {mode: 'collect'});
      })
      // Wrap errors.
      .catch(err => {
        throw new Error(err, 'Error while shutting down.');
      });
    })
    /*
     * Event that allows you to do some things after the docker engine is booted
     * up.
     *
     * @since 3.0.0
     * @event post_engine_down
     */
    .then(() => self.events.emit('post-engine-down'));
  }

  /*
   * Helper to determine up and down
   */
  isUp(log, cache, docker) {
    if (_.toString(shell.which(docker)).toUpperCase() !== docker.toUpperCase()) {
      throw Error('Lando thinks you might need some help with your droid');
    }
    // Auto return if cached and true
    if (cache.get('engineup') === true) return Promise.resolve(true);
    // Return true if we get a zero response and cache the result
    return shell.sh([docker, 'info'])
    .then(() => {
      log.debug('Engine is up.');
      cache.set('engineup', true, {ttl: 5});
      return Promise.resolve(true);
    })
    .catch(error => {
      log.debug('Engine is down with error %s', error);
      return Promise.resolve(false);
    });
  };
};
