'use strict';

module.exports = lando => {
  // Load in our init method
  lando.init.add('pantheon', require('./init')(lando));

  // Modules
  const _ = lando.node._;

  // Lando things
  const PantheonApiClient = require('./client');
  const api = new PantheonApiClient(lando.log);

  /*
   * Event based logix
   */
  lando.events.on('post-instantiate-app', app => {
    // Cache key helpers
    const siteMetaDataKey = 'site.meta.';

    // Set new terminus key into the cache
    app.events.on('pre-terminus', () => {
      if (_.get(lando.cli.argv()._, '[1]') === 'auth:login') {
        if (_.has(lando.cli.argv(), 'machineToken')) {
          // Build the cache
          // @TODO: what do do about email?
          const token = _.get(lando.cli.argv(), 'machineToken');
          const data = {token: token};

          // Mix in any existing cache data
          if (!_.isEmpty(lando.cache.get(siteMetaDataKey + app.name))) {
            data = _.merge(lando.cache.get(siteMetaDataKey + app.name), data);
          }

          // Reset the cache
          lando.cache.set(siteMetaDataKey + app.name, data, {persist: true});
        }
      }
    });

    // Destroy the cached site data
    app.events.on('post-destroy', () => {
      lando.cache.remove(siteMetaDataKey + app.name);
    });
  });

  /*
   * Helper to mix in the correct tooling
   */
  const tooling = config => {
    // Helper func to get envs
    const getEnvs = (done, nopes) => {
      // Envs to remove
      const restricted = nopes || [];

      // Get token
      const token = _.get(lando.cache.get('site.meta.' + config._app), 'token');

      // If token does not exist prmpt for auth
      if (_.isEmpty(token)) {
        lando.log.error('Looks like you dont have a machine token!');
        throw new Error('Run lando terminus auth:login --machine-token=TOKEN');
      }

      // Validate we have a token and siteid
      _.forEach([token, config.id], prop => {
        if (_.isEmpty(prop)) {
          lando.log.error('Error getting token or siteid.', prop);
          throw new Error('Make sure you run: lando init pantheon');
        }
      });

      // Get the pantheon sites using the token
      api.auth(token).then(authorizedApi => authorizedApi.getSiteEnvs(config.id))

      // Parse the evns into choices
      .map(env => ({name: env.id, value: env.id}))

      // Filter out any restricted envs
      .filter(env => !_.includes(restricted, env.value))

      // Done
      .then(envs => {
        envs.push({name: 'none', value: 'none'});
        done(null, envs);
      });
    };

    // Add in default pantheon tooling
    const tools = {
      'terminus': {
        service: 'appserver',
        needs: ['database'],
      },
    };

    // Add in the pull command
    tools.pull = {
      service: 'appserver',
      description: 'Pull code, database and/or files from Pantheon',
      needs: ['database'],
      cmd: '/helpers/pull.sh',
      options: {
        code: {
          description: 'The environment to get the code from or [none]',
          passthrough: true,
          alias: ['c'],
          interactive: {
            type: 'list',
            message: 'Pull code from?',
            choices: function() {
              getEnvs(this.async());
            },
            default: config.env || 'dev',
            weight: 600,
          },
        },
        database: {
          description: 'The environment to get the db from or [none]',
          passthrough: true,
          alias: ['d'],
          interactive: {
            type: 'list',
            message: 'Pull DB from?',
            choices: function() {
              getEnvs(this.async());
            },
            default: config.env || 'dev',
            weight: 601,
          },
        },
        files: {
          description: 'The environment to get the files from or [none]',
          passthrough: true,
          alias: ['f'],
          interactive: {
            type: 'list',
            message: 'Pull files from?',
            choices: function() {
              getEnvs(this.async());
            },
            default: config.env || 'dev',
            weight: 602,
          },
        },
        rsync: {
          description: 'Rsync the files, good for subsequent pulls',
          passthrough: true,
          boolean: true,
          default: false,
        },
      },
    };

    // Add in the push command
    tools.push = {
      service: 'appserver',
      description: 'Push code, database and/or files to Pantheon',
      cmd: '/helpers/push.sh',
      needs: ['database'],
      options: {
        code: {
          description: 'The environment to push the code to or [none]',
          default: 'dev',
          passthrough: true,
          alias: ['c'],
          interactive: {
            type: 'list',
            message: 'Push code to?',
            choices: function() {
              getEnvs(this.async(), ['test', 'live']);
            },
            default: 'dev',
            weight: 500,
          },
        },
        message: {
          description: 'A message describing your change',
          passthrough: true,
          alias: ['m'],
          interactive: {
            type: 'string',
            message: 'What did you change?',
            default: 'My awesome Lando-based changes',
            weight: 600,
            when: function(answers) {
              return answers.code !== 'none' && lando.cli.argv().code !== 'none';
            },
          },
        },
        database: {
          description: 'The environment to push the db to or [none]',
          passthrough: true,
          alias: ['d'],
          interactive: {
            type: 'list',
            message: 'Push db to?',
            choices: function() {
              getEnvs(this.async(), ['test', 'live']);
            },
            default: 'none',
            weight: 601,
          },
        },
        files: {
          description: 'The environment to push the files to or [none]',
          passthrough: true,
          alias: ['f'],
          interactive: {
            type: 'list',
            message: 'Push files to?',
            choices: function() {
              getEnvs(this.async(), ['test', 'live']);
            },
            default: 'none',
            weight: 602,
          },
        },
      },
    };

    // Add in the switch command
    tools['switch <env>'] = {
      service: 'appserver',
      description: 'Switch to a different multidev environment',
      needs: ['database'],
      cmd: '/helpers/switch.sh',
      options: {
        'no-db': {
          description: 'Do not switch the database',
          boolean: true,
          default: false,
        },
        'no-files': {
          description: 'Do not switch the files',
          boolean: true,
          default: false,
        },
      },
    };

    // Return the tools
    return tools;
  };

  /*
   * Build out Pantheon
   */
  const build = (name, config) => {
    // If this is Drupal8 let's add in drupal console and reset drush so it
    // globally installs Drush 8 FOR NOW
    // See: https://github.com/lando/lando/issues/580
    if (config.framework === 'drupal8') {
      config.drupal = true;
      config.drush = 'stable';
    }

    // Set the appserver to depend on index start up so we know our certs will be there
    const dependsPath = 'services.appserver.overrides.services.depends_on';
    _.set(build, dependsPath, ['index']);

    // Add in our pantheon script
    // NOTE: We do this here instead of in /scripts because we need to gaurantee
    // it runs before the other build steps so it can reset our CA correctly
    build.services.appserver.install_dependencies_as_root_internal = ['/helpers/pantheon.sh'];

    // Reset the proxy to route through the edge
    build.proxy = proxy(name);

    // Mix in our tooling
    build.tooling = _.merge(build.tooling, tooling(config));

    // Login with terminus if we have a token
    const cache = lando.cache.get('site.meta.' + config._app);
    if (_.has(cache, 'token')) {
      const token = _.get(cache, 'token');
      const terminusLogin = 'terminus auth:login --machine-token=' + token;
      build.services[cliService].install_dependencies_as_me_internal.push(terminusLogin);
    }

    // Return the things
    return build;
  };

  // Return the things
  return {
    build: build,
    configDir: __dirname,
    webroot: false,
    name: false,
  };
};
