'use strict';

// Modules
const _ = require('lodash');
const env = require('./env');
const Promise = require('./../../../lib/promise');
const Shell = require('./../../../lib/shell');
const shell = new Shell();

/*
 * Helper for isInstalled
 */
exports.isInstalled = (docker = env.getDockerExecutable()) => {
  if (_.toString(shell.which(docker)).toUpperCase() === docker.toUpperCase()) return Promise.resolve(true);
  else return Promise.resolve(false);
};

/*
 * Helper for isUp
 * @todo: lando usage here is nasty
 */
exports.isUp = (lando, docker = env.getDockerExecutable()) => {
  // Check out cache for upness first
  if (lando.cache.get('engineup') === true) return Promise.resolve(true);
  // Whitelist this in windows for now
  return lando.shell.sh([docker, 'info'])
  // Return true if we get a zero response and cache the result
  .then(() => {
    lando.log.debug('Engine is up.');
    lando.cache.set('engineup', true, {ttl: 5});
    return Promise.resolve(true);
  })
  // Return false if we get a non-zero response
  .catch(error => {
    lando.log.debug('Engine is down with error %s', error);
    return Promise.resolve(false);
  });
};

/*
 * Helper for up
 * @todo: lando usage here is nasty
 */
exports.up = (lando, docker = env.getDockerExecutable()) => {
  // Automatically return true if we are in the GUI and on linux because
  // this requires SUDO and because the daemon should always be running on nix
  if (lando.config.process !== 'node' && process.platform === 'linux') return Promise.resolve(true);

  // Get status
  return isUp().then(isUp => {
    if (!isUp) {
      lando.log.warn('Whoops! Lando has detected that Docker is not turned on!');
      lando.log.warn('Give us a few moments while we try to start it up for you');
      const opts = (process.platform === 'win32') ? {detached: true} : {};
      return lando.shell.sh(env.buildDockerCmd('start'), opts);
    }
  })

  // Wait for the daemon to respond
  .retry(() => {
    lando.log.warn('Docker has started but we are waiting for a connection');
    lando.log.warn('You should be good to go momentarily!');
    return lando.shell.sh([DOCKER_EXECUTABLE, 'info'], {mode: 'collect'});
  }, {max: 25, backoff: 1000})

  // Engine is good!
  .then(lando.log.info('Engine activated.'))

  // Wrap errors.
  .catch(err => {
    throw new Error(err, 'Error bringing daemon up.');
  });
};


/*
 * Helper for down
 * @todo: lando usage here is nasty
 */
exports.down = lando => {
  // Automatically return true if we are in the GUI and on linux because
  // this requires SUDO and because the daemon should always be running on nix
  if (lando.config.process !== 'node' && process.platform === 'linux') return Promise.resolve(true);
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
  // Get provider status.
  return exports.isUp()
  // Shut provider down if its status is running.
  .then(isUp => {
    if (isUp) {
      return lando.shell.sh(env.buildDockerCmd('stop'), {mode: 'collect'});
    }
  })
  // Wrap errors.
  .catch(err => {
    throw new Error(err, 'Error while shutting down.');
  });
};
