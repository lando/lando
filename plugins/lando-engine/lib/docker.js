'use strict';

// Modules
const _ = require('lodash');
const Dockerode = require('dockerode');
const Promise = require('./../../../lib/promise');
const utils = require('./utils');

/*
 * Creates a new yaml instance.
 */
module.exports = class Landerode extends Dockerode {
  constructor(opts = {}, promise = Promise) {
    opts.Promise = promise;
    super(opts);
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
    return this.getContainer(cid).inspect()
    // Wrap errors.
    .catch(err => {
      throw new Error(err, 'Error inspecting container: %s.', cid);
    });
  };

  /*
   * Return true if the container is running otherwise false.
   */
  isRunning(cid) {
    return this.inspect(cid)
    // Get the runnign state
    .then(data => _.get(data, 'State.Running', false))
    // If the container no longer exists, return false since it isn't running.
    // This will prevent a race condition from happening.
    // Wrap errors.
    .catch(err => {
      if (_.includes(err.message, `No such container: ${cid}`)) return false;
      else throw new Error(err, 'Error querying isRunning: "%s".', cid);
    });
  };

  /*
   * Returns a list of Lando containers
   */
  list(appName) {
    return this.listContainers()
    // Filter out containers with invalid status
    .filter(data => data.Status !== 'Removal In Progress')
    // Map docker containers to lando containers.
    .map(container => utils.toLandoContainer(container))
    // Filter out nulls and undefineds.
    .filter(_.identity)
    // Filter out all non-lando containers
    .filter(data => data.lando === true)
    // Filter by app name if an app name was given.
    .then(containers => (appName) ? _.filter(containers, container => container.app === appName) : containers);
  };

  /*
   * Remove a container.
   * @todo: do we even use this anymore?
   */
  remove(cid, opts = {v: true, force: false}) {
    return this.getContainer(cid).remove(opts)
    // Wrap errors.
    .catch(err => {
      throw new Error(err, 'Error removing container %s.', cid);
    });
  };

  /*
   * Do a docker exec
   */
  run(id, cmd, opts = {}) {
    // Get our options;
    const {execOpts, startOpts, attached} = utils.runConfig(cmd, opts, opts.mode);
    // Setup and start the exec
    return this.getContainer(id).exec(execOpts).then(exec => exec.start(startOpts)
    // Cross the streams
    .then(result => utils.runStream(result.output, attached)
    // Inspect the exec and determine the rejection
    .then(data => exec.inspect()
    // Determine whether we can reject or not
    .then(result => new Promise((resolve, reject) => {
      if (result.ExitCode === 0) resolve(data.stdout);
      else reject({message: data.stderr + data.stdout, code: result.ExitCode});
    })))));
  };
};
