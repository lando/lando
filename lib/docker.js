/**
 * Router to pass request to either docker engine or docker compose
 *
 * @name docker
 */

'use strict';

// Modules
var _ = require('./node')._;
var Promise = require('./promise');
var compose = require('./compose');
var container = require('./container');

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
      appName = appName.replace(/-/g, '');
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
      return compose.start(datum.compose, datum.project, datum.opts);
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
      return this.list(null)
      .then(function(containers) {
        // Build set of all valid container ids.
        var idSet =
          _(containers)
          .chain()
          .map(function(container) {
            return [container.id, container.name];
          })
          .flatten()
          .uniq()
          .object()
          .value();
        // Search set of valid containers for data.
        return _.has(idSet, getId(datum));
      });
    }
  });
};

/**
 * Create and run a command inside of a container.
 */
exports.run = function(data) {
  return Promise.retry(function() {
    return Promise.all(_.map(normalizer(data), function(datum) {

      // docker-compose run requires stdin to be a tty which causes
      // all sorts of chaos when you are running this through nodewebkit
      //
      // Until we can do this directly we compose run to get docker
      // config and then hit up dockerode for analogous run activity

      // can inspect a started container
      var winOpts = {
        background: true,
        rm: false,
        entrypoint: 'tail',
        cmd: ['-f', '/dev/null']
      };

      // Do the run and return the ID
      return compose.run(
        datum.compose,
        datum.project,
        _.extend({}, datum.opts, winOpts)
      )

      // Inspect
      .then(function(output) {
        // @todo: a better way to do this?
        var splitter = (process.platform === 'win32') ? '\r\n' : '\n';
        var parts = output.split(splitter);
        parts.pop();
        var id = _.last(parts);
        return container.inspect(id);
      })

      // Remove the container and tap the data
      .tap(function(data) {
        return container.remove(data.Id, {force: true, v: true});
      })

      // Now for the crazy shit
      .then(function(data) {

        // Parse commandy data
        var c = datum.opts.cmd;
        var e = datum.opts.entrypoint;
        var command = (_.isArray(e)) ? [c.join(' ')] : (c || []);
        var entrypoint = (!_.isArray(e)) ? [e] : e;

        // Refactor our create options
        // Handle opts.mode?
        var createOpts = data.Config;
        createOpts.Cmd = _.flatten(command);
        createOpts.name = _.trimLeft(data.Name, '/');
        createOpts.AttachStdin = true;
        createOpts.AttachStdout = true;
        createOpts.AttachStderr = true;
        createOpts.Mounts = data.Mounts;
        createOpts.HostConfig = data.HostConfig;
        createOpts.Tty = true;
        createOpts.OpenStdin = true;
        createOpts.StdinOnce = true;
        createOpts.Entrypoint = entrypoint;

        // Try to do the run
        return container.run(createOpts, datum.opts);

      });
    }));
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
        return container.remove(getId(datum));
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
