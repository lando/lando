'use strict';

// Modules
const _ = require('lodash');
const Promise = require('./../../../lib/promise');
const utils = require('./utils');

// Helper to retry each
const retryEach = (data, run) => Promise.each(utils.normalizer(data), datum => Promise.retry(() => run(datum)));

// Helper to run engine event commands
exports.engineCmd = (name, daemon, events, data, run) => daemon.up()
  .then(() => events.emit(`pre-engine-${name}`, data))
  .then(() => run(data))
  .tap(() => events.emit(`post-engine-${name}`, data));

/*
 * Helper to route to build command
 */
exports.build = (data, compose) => retryEach(data, datum => compose('pull', datum))
  .then(() => retryEach(data, datum => compose('build', datum)));

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
  if (data.compose) return compose('getId', datum).then(id => !_.isEmpty(id));
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
exports.run = (data, compose, docker, started = true) => Promise.each(utils.normalizer(data), datum => {
  return docker.isRunning(utils.getId(datum)).then(isRunning => {
    started = isRunning;
    if (!isRunning) return exports.start(datum, compose);
  })
  // There is weirdness starting up an exec via the Docker Remote API when
  // accessing the daemon through a named pipe on Windows. Until that is
  // resolved we currently shell the exec out to docker-compose
  //
  // See: https://github.com/apocas/docker-modem/issues/83
  //
  .then(() => {
    if (process.platform === 'win32') {
      return compose('run', _.merge({}, datum, {opts: {cmd: datum.cmd}}));
    } else {
      return docker.run(datum.id, datum.cmd, datum.opts);
    }
  })
  // Stop if we have to
  .tap(() => {
    if (!started) return exports.stop(datum, compose, docker);
  })
  // Destroy if we have to
  .tap(() => {
    if (_.get(datum, 'opts.autoRemove', false)) return exports.destroy(datum, compose, docker);
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
        return docker.inspect(_.trim(ids.shift()));
      }
    });
  } else if (utils.getId(data)) {
    return docker.inspect(utils.getId(data));
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
