/**
 * Router to pass request to either docker engine or docker compose
 *
 * @module docker
 */

'use strict';

// Modules
var _ = require('./node')._;
var Promise = require('./promise');
var compose = require('./compose');
var container = require('./container');
var networks = require('./networks');
var self = this;
var utils = require('./utils');

/*
 * We might have datum but we need to wrap in array so Promise.each knows
 * what to do
 */
var normalizer = function(data) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  return data;
};

/*
 * Helper to return a valid id from app data
 */
var getId = function(c) {
  return c.cid || c.id || c.containerName || c.containerID || c.name;
};

/**
 * Query docker for a list of containers.
 */
exports.list = function(appName) {

  // Validate inputs.
  return Promise.try(function() {
    if (appName && typeof appName !== 'string') {
      throw new TypeError('Invalid appName: ' + appName);
    }

    if (typeof appName === 'string') {
      appName = utils.dockerComposify(appName);
    }
  })

  .then(function() {
    return Promise.retry(function() {
      return container.list(appName);
    });
  });

};

/**
 * Inspect a container.
 */
exports.inspect = function(datum) {
  return Promise.retry(function() {
    if (datum.compose) {
      return compose.getId(datum.compose, datum.project, datum.opts)
      .then(function(id) {
        if (!_.isEmpty(id)) {
          // @todo: this assumes that the container we want
          // is probably the first id returned. What happens if that is
          // not true or we need other ids for this service?
          var ids = id.split('\n');
          return container.inspect(_.trim(ids.shift()));
        }
      });
    }
    else if (getId(datum)) {
      return container.inspect(getId(datum));
    }
  });
};

/**
 * Return true if the container is running otherwise false.
 */
exports.isRunning = function(cid) {
  return Promise.retry(function() {
    return container.isRunning(cid);
  });
};

/**
 * Start container(s).
 */
exports.start = function(data) {
  return Promise.each(normalizer(data), function(datum) {
    return Promise.retry(function() {

      // Start the thing in question
      return compose.start(datum.compose, datum.project, datum.opts)

      // Look to see if we need to prune the networks
      // Sadly we can't do much to determine whether the error is the one
      // we are looking for but we HOPE if this fails its caught downstream
      .catch(function(err) {
        return networks.prune()
        .then(function() {
          return Promise.reject(err);
        });
      });

    });
  });
};

/**
 * Get container logs.
 */
exports.logs = function(data) {
  return Promise.each(normalizer(data), function(datum) {
    return Promise.retry(function() {
      return compose.logs(datum.compose, datum.project, datum.opts);
    });
  });
};

/**
 * Check if container exists
 */
exports.exists = function(datum) {
  return Promise.retry(function() {
    if (datum.compose) {
      return compose.getId(datum.compose, datum.project, datum.opts)
      .then(function(id) {
        return !_.isEmpty(id);
      });
    }
    else if (getId(datum)) {
        // Get list of containers.
      return self.list(null)
      .then(function(containers) {

        // Start an ID collector
        var ids = [];

        // Add all relevant ids
        _.forEach(containers, function(container) {
          ids.push(container.id);
          ids.push(container.name);
        });

        // Search set of valid containers for data.
        return _.includes(ids, getId(datum));

      });
    }
  });
};

/**
 * Create and run a command inside of a container.
 */
exports.run = function(data) {
  return Promise.each(normalizer(data), function(datum) {

    // Get the opts
    var opts = datum.opts || {};

    // There is weirdness starting up an exec via the Docker Remote API when
    // accessing the daemon through a named pipe on Windows. Until that is
    // resolved we currently shell the exec out to docker-compose
    //
    // See: https://github.com/apocas/docker-modem/issues/83
    //
    if (process.platform === 'win32') {
      opts.cmd = datum.cmd;
      return compose.run(datum.compose, datum.project, opts);
    }

    // POSIX
    // @todo: now that docker compose exec works in windows maybe we should just do
    // all platforms through docker compose now?
    else {
      return container.run(datum.id, datum.cmd, opts);
    }

  });
};

/**
 * Stop a container.
 */
exports.stop = function(data) {
  return Promise.each(normalizer(data), function(datum) {
    return Promise.retry(function() {
      if (datum.compose) {
        return compose.stop(datum.compose, datum.project, datum.opts);
      }
      else if (getId(datum)) {
        return container.stop(getId(datum));
      }
    });
  });
};

/**
 * Remove a container.
 */
exports.remove = function(data) {
  return Promise.each(normalizer(data), function(datum) {
    return Promise.retry(function() {
      if (datum.compose) {
        return compose.remove(datum.compose, datum.project, datum.opts);
      }
      else if (getId(datum)) {
        return container.remove(getId(datum), datum.opts);
      }
    });
  });
};

/**
 * Builds and/or pulls a docker image
 */
exports.build = function(data) {
  return Promise.each(normalizer(data), function(datum) {
    return Promise.retry(function() {
      return compose.pull(datum.compose, datum.project, datum.opts);
    });
  })
  .then(function() {
    return Promise.each(normalizer(data), function(datum) {
      return Promise.retry(function() {
        return compose.build(datum.compose, datum.project, datum.opts);
      });
    });
  });
};
