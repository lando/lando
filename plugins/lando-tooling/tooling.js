'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var Promise = lando.Promise;
  var format = require('util').format;
  var utils = require('./lib/utils');

  /**
   * The tooling command builder
   *
   * @since 3.0.0
   * @alias 'lando.tooling.build'
   */
  var build = function(config) {

    /*
     * Get the run handler
     */
    var run = function(answers) {

      // Handle dynamic services right off the bat
      if (_.startsWith(_.get(config, 'service'), ':')) {
        var serviceOption = config.service.split(':')[1];
        config.service = answers[serviceOption];
      }

      // Kick off some collectors
      var ids = [config.service];
      var existsCheck = [];
      var runCheck = [];

      // Add our needs
      if (_.has(config, 'needs')) {

        // Normalize
        if (!_.isArray(config.needs)) {
          config.needs = [config.needs];
        }

        // And add
        ids = _.uniq(_.flatten(ids.concat(config.needs)));

      }

      // Build our checkers
      _.forEach(ids, function(id) {
        var container = [config.app.name, id, '1'].join('_');
        existsCheck.push(lando.engine.exists({id: container}));
        runCheck.push(lando.engine.isRunning(container));
      });

      // Let's check to see if the container exists
      return Promise.all(existsCheck)

      // If they dont, immediately start, if not check if they are running already
      .then(function(exists) {

        // Helper
        var descartes = function(current, exist) {
          return current && exist;
        };

        // Pass to should start if something doesnt exist
        if (!_.reduce(exists, descartes, true)) {
          return true;
        }

        // Else pass to check for startage
        else {
          return Promise.all(runCheck)
          .then(function(isRunning) {
            return !_.reduce(isRunning, descartes, true);
          });
        }

      })

      // If not let's make sure we start it
      .then(function(shouldStart) {
        if (shouldStart) {
          _.set(config, 'app.opts.services', ids);
          return lando.engine.start(config.app);
        }
      })

      // Run the command
      .then(function() {

        // Standardize and arrayify
        if (_.has(config, 'cmd')) {
          if (!_.isString(config.cmd) && !_.isObjectLike(config.cmd)) {
            config.cmd = _.toString(config.cmd);
          }
          if (_.has(config, 'cmd') && _.isString(config.cmd)) {
            config.cmd = config.cmd.split(' ');
          }
        }

        // Start with the entrypoint
        var cmd = config.cmd || [config.name];

        // Add in args if we expect them
        if (lando.config.process === 'node') {
          cmd = cmd.concat(utils.largs(config));
        }

        // Get the backup user
        var userPath = 'environment.LANDO_WEBROOT_USER';
        var user = _.get(config.app.services[config.service], userPath, 'root');
        var name = config.name;
        var eventName = name.split(' ')[0];

        // Build out our options
        var options = {
          id: [config.app.name, config.service, '1'].join('_'),
          compose: config.app.compose,
          project: config.app.name,
          cmd: cmd,
          opts: {
            app: config.app,
            mode: 'attach',
            pre: ['cd', utils.getContainerPath(config.app.root)].join(' '),
            user: config.user || user,
            services: [config.service],
            hijack: config.hijack || false
          }
        };

        // If this is a specal "passthrough" command lets make sure we are
        // appending options
        _.forEach(config.options, function(option, key) {
          if (option.passthrough && key) {
            cmd.push('--' + key);
            cmd.push(answers[key]);
          }
        });

        // Run a pre-event
        return config.app.events.emit(['pre', eventName].join('-'), config)

        // Exec
        .then(function() {
          return lando.engine.run(options);
        })

        // Check for error code and kill with that code, this ensures that
        // the correct error code is bubbling up and should help provide similar
        // experience when running these commands in something like travis
        .catch(function(error) {
          error.hide = true;
          throw error;
        })

        // Post event
        .then(function() {
          return config.app.events.emit(['post', eventName].join('-'), config);
        });

      });

    };

    // Return our tasks
    return {
      name: _.first(config.name.split(' ')),
      command: config.name,
      describe: config.description || format('Run %s commands', config.name),
      run: run,
      options: config.options || {}
    };

  };

  // Return things
  return {
    build: build
  };

};
