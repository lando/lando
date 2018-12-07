'use strict';

// Modules
const _ = require('lodash');
const Dockerode = require('dockerode');
const fs = require('fs');
const Promise = require('./promise');
const utils = require('./utils');

/*
 * Helper for direct container opts
 */
const containerOpt = (container, method, message, opts = {}) => container[method](opts).catch(err => {
  throw new Error(err, message, container);
});

/*
 * Creates a new yaml instance.
 */
module.exports = class Landerode extends Dockerode {
  constructor(opts = {}, id = 'lando', promise = Promise) {
    opts.Promise = promise;
    super(opts);
    this.id = id;
  };

  /*
   * Creates a network
   */
  createNet(name, opts = {}) {
    return this.createNetwork(_.merge({}, opts, {Name: name}))
    // Wrap errors.
    .catch(err => {
      throw new Error(err, 'Error creating network.');
    });
  };

  /*
   * Inspects a container.
   */
  inspect(cid) {
    return containerOpt(this.getContainer(cid), 'inspect', 'Error inspecting container: %j');
  };

  /*
   * Return true if the container is running otherwise false.
   */
  isRunning(cid) {
    return this.inspect(cid)
    // Get the running state
    .then(data => _.get(data, 'State.Running', false))
    // If the container no longer exists, return false since it isn't running.
    // This will prevent a race condition from happening.
    // Wrap errors.
    .catch(err => {
      if (_.includes(err.message, `No such container: ${cid}`)) return false;
      else throw err;
    });
  };

  /*
   * Returns a list of Lando containers
   */
  list(appName) {
    return this.listContainers()
    // Filter out nulls and undefineds.
    .filter(_.identity)
    // Filter out containers with invalid status
    .filter(data => data.Status !== 'Removal In Progress')
    // Map docker containers to lando containers.
    .map(container => utils.toLandoContainer(container))
    // Filter out all non-lando containers
    .filter(data => data.lando === true)
    // Filter out other instances
    .filter(data => data.instance === this.id)
    // Remove orphaned app containers
    .filter(container => {
      if (!fs.existsSync(container.src) && container.kind === 'app') {
        return this.remove(container.id, {force: true}).then(() => false);
      } else {
        return true;
      }
    })
    // Filter by app name if an app name was given.
    .then(containers => (appName) ? _.filter(containers, c => c.app === utils.dockerComposify(appName)) : containers);
  };

  /*
   * Remove a container.
   * @todo: do we even use this anymore?
   */
  remove(cid, opts = {v: true, force: false}) {
    return containerOpt(this.getContainer(cid), 'remove', 'Error removing container: %j', opts);
  };

  /*
   * Do a docker exec
   */
  run(id, cmd, opts = {}) {
    // Get our options;
    const {execOpts, startOpts, attached} = utils.runConfig(cmd, opts, opts.mode);
    // Setup and start the exec
    return this.getContainer(id).exec(execOpts)
    .then(exec => exec.start(startOpts)
      // Cross the streams
      .then(result => utils.runStream(result.output, attached)
        // Inspect the exec and determine the rejection
        .then(data => exec.inspect()
          // Determine whether we can reject or not
          .then(result => new Promise((resolve, reject) => {
            if (opts.detach) resolve();
            if (result.ExitCode === 0) resolve(data.stdout);
            else reject({message: data.stderr + data.stdout, code: result.ExitCode});
          }))
        )
      )
    );
  };

  /*
   * Do a docker stop
   */
  stop(cid, opts = {}) {
    return containerOpt(this.getContainer(cid), 'stop', 'Error stopping container: %j', opts);
  };
};
