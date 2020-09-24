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
 * Helper to determine files exists in an array of files
 */
const srcExists = (files = []) => _.reduce(files, (exists, file) => fs.existsSync(file) || exists, false);

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
    return this.createNetwork(_.merge({}, opts, {Name: name, Attachable: true, Internal: true}))
    // Wrap errors.
    .catch(err => {
      throw new Error(err, 'Error creating network.');
    });
  };

  /*
   * Inspects a container.
   */
  scan(cid) {
    return containerOpt(this.getContainer(cid), 'inspect', 'Error inspecting container: %j');
  };

  /*
   * Return true if the container is running otherwise false.
   */
  isRunning(cid) {
    return this.scan(cid)
    // Get the running state
    .then(data => _.get(data, 'State.Running', false))
    // If the container no longer exists, return false since it isn't running.
    // This will prevent a race condition from happening.
    // Wrap errors.
    .catch(err => {
      // This was true for docker composer 1.26.x and below
      if (_.includes(err.message, `No such container: ${cid}`)) return false;
      // This is what it looks like for 1.27 and above
      else if (_.includes(err.message, `no such container -`)) return false;
      // Otherwise throw
      else throw err;
    });
  };

  /*
   * Returns a list of Lando containers
   */
  list(options = {}) {
    return this.listContainers(options)
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
      if (!srcExists(container.src) && container.kind === 'app') {
        return this.remove(container.id, {force: true}).then(() => false);
      } else {
        return true;
      }
    })
    // Filter by app name if an app name was given.
    .then(containers => {
      if (options.project) return _.filter(containers, c => c.app === options.project);
      else if (options.app) return _.filter(containers, c => c.app === utils.dockerComposify(options.app));
      return containers;
    })
    // And finally filter by everything else
    .then(containers => {
      if (!_.isEmpty(options.filter)) {
        return _.filter(containers, _.fromPairs(_.map(options.filter, filter => filter.split('='))));
      } else {
        return containers;
      }
    });
  };

  /*
   * Remove a container.
   * @todo: do we even use this anymore?
   */
  remove(cid, opts = {v: true, force: false}) {
    return containerOpt(this.getContainer(cid), 'remove', 'Error removing container: %j', opts);
  };

  /*
   * Do a docker stop
   */
  stop(cid, opts = {}) {
    return containerOpt(this.getContainer(cid), 'stop', 'Error stopping container: %j', opts);
  };
};
