'use strict';

// Modules
const _ = require('lodash');
const Promise = require('./promise');
const utils = require('./utils');

// Helper to strip user from opts
// NOTE: we need this because our run command will try start/stop with run opts if it needs to
// and docker compose does not like that
const stripRun = datum => {
  const newDatum = _.cloneDeep(datum);
  if (_.has(newDatum, 'opts.user')) delete newDatum.opts.user;
  if (_.has(newDatum, 'opts.workdir')) delete newDatum.opts.workdir;
  if (_.has(newDatum, 'opts.environment')) delete newDatum.opts.environment;
  if (_.has(newDatum, 'opts.detach')) delete newDatum.opts.detach;
  return newDatum;
};

// Helper to retry each
const retryEach = (data, run) => Promise.each(utils.normalizer(data), datum => run(datum));

// Helper to run engine event commands
exports.eventWrapper = (name, daemon, events, data, run) => daemon.up()
  .then(() => events.emit(`pre-engine-${name}`, data))
  .then(() => run(data))
  .tap(() => events.emit(`post-engine-${name}`, data));

/*
 * Helper to route to build command
 */
exports.build = (data, compose) => {
  // Pull
  return retryEach(data, datum => compose('pull', datum))
  // then build
  .then(() => retryEach(data, datum => compose('build', datum)));
};

/*
 * Helper to route to destroy command
 */
exports.destroy = (data, compose, docker) => retryEach(data, datum => {
  return (datum.compose) ? compose('remove', datum) : docker.remove(utils.getId(datum), datum.opts);
});

/*
 * Helper to route to exist command
 */
exports.exists = (data, compose, docker, ids = []) => {
  if (data.compose) return compose('getId', data).then(id => !_.isEmpty(id));
  else {
    return docker.list()
    .each(container => {
      ids.push(container.id);
      ids.push(container.name);
    })
    .then(() => _.includes(ids, utils.getId(data)));
  }
};

/*
 * Helper to route to destroy command
 */
exports.logs = (data, compose) => retryEach(data, datum => compose('logs', datum));

/*
 * Helper to route to run command
 */
exports.run = (data, compose, docker, started = true) => Promise.mapSeries(utils.normalizer(data), datum => {
  // Merge in default cli envars
  datum.opts.environment = utils.getCliEnvironment(datum.opts.environment);
  // Escape command if it is still a string
  if (_.isString(datum.cmd)) datum.cmd = utils.shellEscape(datum.cmd, true);
  return docker.isRunning(utils.getId(datum)).then(isRunning => {
    started = isRunning;
    if (!isRunning) {
      return exports.start(stripRun(datum), compose).then(() => {
        // if this is a prestart build step and its not the last one make sure we set started = true
        // this prevents us from having to stop and then restart the container during builds
        started = _.get(datum, 'opts.prestart', false) && !_.get(datum, 'opts.last', false);
      });
    }
  })
  // Why were we still using dockerode for this on non-win?
  .then(() => compose('run', _.merge({}, datum, {opts: {cmd: datum.cmd, id: datum.id}})))
  // Stop if we have to
  .tap(() => {
    // If this is the last step of a build we need to make sure all the containers are stopped
    if (_.get(datum, 'opts.prestart', false) && _.get(datum, 'opts.last', false)) delete datum.opts.services;
    // Stop if we have to and remove build flags so lando doesn't get tripped up downstream
    if (!started || _.get(datum, 'opts.last', false)) return exports.stop(stripRun(datum), compose, docker);
  })
  // Destroy if we have to
  .tap(() => {
    if (!started && _.get(datum, 'opts.autoRemove', false)) return exports.destroy(stripRun(datum), compose, docker);
  });
});

/*
 * Helper to route to scan command
 */
exports.scan = (data, compose, docker) => {
  if (data.compose) {
    return compose('getId', data).then(id => {
      if (!_.isEmpty(id)) {
        // @todo: this assumes that the container we want
        // is probably the first id returned. What happens if that is
        // not true or we need other ids for this service?
        const ids = id.split('\n');
        return docker.scan(_.trim(ids.shift()));
      }
    });
  } else if (utils.getId(data)) {
    return docker.scan(utils.getId(data));
  }
};

/*
 * Helper to route to start command
 */
exports.start = (data, compose) => retryEach(data, datum => compose('start', datum));

/*
 * Helper to route to stop command
 */
exports.stop = (data, compose, docker) => retryEach(data, datum => {
  return (datum.compose) ? compose('stop', datum) : docker.stop(utils.getId(datum));
});
