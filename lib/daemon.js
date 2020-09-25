'use strict';

// Modules
const _ = require('lodash');
const Cache = require('./cache');
const env = require('./env');
const Events = require('./events');
const fs = require('fs');
const Log = require('./logger');
const path = require('path');
const Promise = require('./promise');
const Shell = require('./shell');
const shell = new Shell();

// Constants
const macOSBase = '/Applications/Docker.app';

/*
 * Get services wrapper
 */
const buildDockerCmd = cmd => {
  switch (process.platform) {
    case 'darwin':
      return ['open', macOSBase];
    case 'linux':
      if (_.includes(_.toString(shell.which('systemctl')), 'systemctl')) {
        return ['sudo', 'systemctl', cmd, 'docker'];
      } else {
        return ['sudo', 'service', 'docker'].concat(cmd);
      }
    case 'win32':
      const base = process.env.ProgramW6432 || process.env.ProgramFiles;
      const dockerBin = base + '\\Docker\\Docker\\Docker Desktop.exe';
      return ['cmd', '/C', `"${dockerBin}"`];
  }
};

/*
 * Helper to build mac docker version get command
 */
const getMacProp = prop => shell.sh(['defaults', 'read', `${macOSBase}/Contents/Info.plist`, prop])
  .then(data => _.trim(data))
  .catch(() => null);

/*
 * Creates a new Daemon instance.
 */
module.exports = class LandoDaemon {
  constructor(
      cache = new Cache(),
      events = new Events(),
      docker = env.getDockerExecutable(),
      log = new Log(),
      context = 'node',
      compose = env.getComposeExecutable()
  ) {
    this.cache = cache;
    this.compose = compose;
    this.context = context;
    this.docker = docker;
    this.events = events;
    this.log = log;
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
    /*
     * Not officially documented event that allows you to do some things before
     * the docker engine is booted up.
     *
     * @since 3.0.0
     * @event pre_engine_up
     */
    return this.events.emit('pre-engine-up').then(() => {
      // Automatically return true if we are in the GUI and on linux because
      // this requires SUDO and because the daemon should always be running on nix
      if (this.context !== 'node' && process.platform === 'linux') return Promise.resolve(true);
      // Turn it on if we can
      return this.isUp().then(isUp => {
        if (!isUp) {
          const retryOpts = {max: 25, backoff: 1000};
          return shell.sh(buildDockerCmd('start'))
          // Likely need to retry until start command completes all good
          .retry(() => this.isUp().then(isUp => (!isUp) ? Promise.reject() : Promise.resolve()), retryOpts)
          // Engine is good!
          .then(() => this.log.info('engine activated.'))
          // Fail if retry is no good
          .catch(err => {
            throw Error('Error bringing daemon up.');
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
    .then(() => this.events.emit('post-engine-up'));
  };

  down() {
    /*
     * Event that allows you to do some things after the docker engine is booted
     * up.
     *
     * @since 3.0.0
     * @event pre_engine_down
     */
    return this.events.emit('pre-engine-down')
    .then(() => {
      // Automatically return true if we are in browsery context and on linux because
      // this requires SUDO and because the daemon should always be running on nix
      if (this.context !== 'node' && process.platform === 'linux') return Promise.resolve(true);
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
      return this.isUp(this.log, this.cache, this.docker).then(isUp => {
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
    .then(() => this.events.emit('post-engine-down'));
  }

  /*
   * Helper to determine up and down
   * NOTE: we now assume that docker has been installed by this point
   * this means we also assume whatever neccessary installation checks have been
   * performed and dockers existence verified
   */
  isUp(log = this.log, cache = this.cache, docker = this.docker) {
    // Auto return if cached and true
    if (cache.get('engineup') === true) return Promise.resolve(true);
    // Return true if we get a zero response and cache the result
    return shell.sh([`"${docker}"`, 'info']).then(() => {
      log.debug('engine is up.');
      cache.set('engineup', true, {ttl: 5});
      return Promise.resolve(true);
    })
    .catch(error => {
      log.debug('engine is down with error', error);
      return Promise.resolve(false);
    });
  };

  /*
   * Helper to get the versions of the things we need
   */
  getVersions() {
    switch (process.platform) {
      case 'darwin':
        return Promise.all([
          getMacProp('EngineVersion'),
          getMacProp('ComposeVersion'),
          getMacProp('CFBundleShortVersionString'),
        ])
        .then(data => ({
          compose: data[1],
          engine: data[0],
          desktop: data[2],
        }));
      case 'linux':
        return Promise.all([
          shell.sh([`"${this.docker}"`, 'version', '--format', '{{.Server.Version}}']).catch(() => '18.0.0'),
          shell.sh([`"${this.compose}"`, 'version', '--short']).catch(() => '11.0.0'),
        ])
        .then(data => ({
          compose: _.trim(data[1]),
          engine: _.trim(data[0]),
          desktop: false,
        }));
      case 'win32':
        const versions = {
          compose: '1.24.1',
          engine: '19.03.1',
          desktop: '2.1.0.1',
        };

        // Possible locations of the component config
        const componentsVersionFiles = [
          path.resolve(this.compose, '..', '..', 'componentsVersion.json'),
          path.resolve(this.compose, '..', '..', '..', 'componentsVersion.json'),
        ];

        // Use the first one we find
        const componentsVersionFile = _.find(componentsVersionFiles, fs.existsSync);
        // If we found one, use it
        if (componentsVersionFile) {
          const componentsVersion = require(componentsVersionFile);
          versions.compose = componentsVersion.ComposeVersion;
          versions.engine = componentsVersion.EngineVersion;
          versions.desktop = componentsVersion.Informational;
        }
        return Promise.resolve(versions);
    }
  };
};
