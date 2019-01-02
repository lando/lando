'use strict';

module.exports = lando => {};

/*
  /*
   * Helper to start util service
  const utilService = (name, app) => {
    // Build util file
    const filename = ['util', name, _.uniqueId()].join('-') + '.yml';
    const utilFile = path.join(utilDir, filename);


    // Log
    lando.log.debug('Run util service %j', service);
    lando.yaml.dump(utilFile, service);

    // Name the project
    const project = 'landoinit' + lando.utils.engine.dockerComposify(name);

    // Try to start the util
    return {
      project: project,
      compose: [utilFile],
      container: [project, 'util', '1'].join('_'),
      opts: {
        services: ['util'],
      },
    };
  };
  /*
   * Helper to return a performant git clone command
   *
   * This clones to /tmp and then moves to /app to avoid file sharing performance
   * hits
   *
   * @since 3.0.0
   * @alias 'lando.init.cloneRepo'
  const cloneRepo = repo => {
    // Get a unique clone folder
    const tmpFolder = '/tmp/' + _.uniqueId('app-');

    // Commands
    const mkTmpFolder = 'mkdir -p ' + tmpFolder;
    const cloneRepo = 'git -C ' + tmpFolder + ' clone ' + repo + ' ./';
    const cpHome = 'cp -rfT ' + tmpFolder + ' /app';

    // Clone cmd
    return [mkTmpFolder, cloneRepo, cpHome].join(' && ');
  };

  /*
   * Helper to return a create key command
   *
   * @since 3.0.0
   * @alias 'lando.init.createKey'
  const createKey = key => {
    // Ensure that cache directory exists
    const keysDir = path.join(lando.config.userConfRoot, 'keys');
    mkdirp.sync(path.join(keysDir));

    // Construct a helpful and instance-specific comment
    const comment = lando.config.instance + '.lando@' + os.hostname();
    const keyPath = '/lando/keys/' + key;

    // Key cmd
    return 'ssh-keygen -t rsa -N "" -C "' + comment + '" -f "' + keyPath + '"';
  };

  /*
   * Run a command during the init process
   *
   * @since 3.0.0
   * @alias 'lando.init.run'
  const run = (name, app, cmd, user) => {
    // Get the service
    const service = utilService(name, app);

    // Build out our run
    const run = {
      id: service.container,
      compose: service.compose,
      project: service.project,
      cmd: cmd,
      opts: {
        mode: 'attach',
        user: user || 'www-data',
        services: service.opts.services || ['util'],
      },
    };

    // Log
    lando.log.verbose('Running %s on %s', run.cmd, run.id);

    // Start the container
    return lando.engine.start(service)

    // On linux lets provide a little delay to make sure our user is set up
    .then(() => {
      if (process.platform === 'linux') {
        return lando.Promise.delay(1000);
      }
    })

    // Exec
    .then(() => lando.engine.run(run));
  };
*/
