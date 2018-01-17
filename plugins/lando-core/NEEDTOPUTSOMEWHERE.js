/*
var APP_ROOT_DIRNAME = process.env.LANDO_CORE_APP_ROOT_DIRNAME || 'Lando';
var LANDOFILE_NAME = process.env.LANDO_CORE_LANDOFILE_NAME || '.lando.yml';
var user = require('./user');


  // App identifier
  var appId = [
    _.get(opts, 'app.name', 'unknown'),
    _.get(opts, 'app.root', 'someplace')
  ];

  // Metadata to report.
  var obj = {
    action: action,
    app: hash(appId),
    type: _.get(opts, 'app.config.recipe', 'none')
  };

  // Build an array of services to send as well
  if (_.has(opts, 'app.config.services')) {
    obj.services = _.map(_.get(opts, 'app.config.services'), function(service) {
      return service.type;
    });
  }

  // Get the email
  var data = cache.get('site:meta:' + config.name);
  if (_.has(data, 'email')) {
    obj.email = _.get(data, 'email');
  }

//appConfigFilename: LANDOFILE_NAME,
//appsRoot: path.join(env.home, APP_ROOT_DIRNAME),
//appRegistry: path.join(env.userConfRoot, 'appRegistry.json'),
//cache: true,
//composeBin: env.composeBin,
//composeVersion: '3.2',
//containerGlobalEnv: {},
//dockerBin: env.dockerBin,
//dockerBinDir: env.dockerBinDir,
//engineId: user.getEngineUserId(),
//engineGid: user.getEngineUserGid(),
//loadPassphraseProtectedKeys: false,

/*

/**
 * Translate a name for use by docker-compose eg strip `-` and `.` and
 * @TODO: possibly more than that
 *
 * @since 3.0.0
 */
 /*
exports.dockerComposify = function(data) {
  return data.replace(/-/g, '').replace(/\./g, '');
};


/**
 * Scans URLs to determine if they are up or down.
 *
 * @since 3.0.0
 * @param {Array} urls - An array of urls like `https://mysite.lndo.site` or `https://localhost:34223`
 * @param {Object} [opts] - Options to configure the scan.
 * @param {Integer} [opts.max=7] - The amount of times to retry accessing each URL.
 * @param {Array} [opts.waitCode=[400, 502] - The HTTP codes to prompt a retry.
 * @returns {Array} An array of objects of the form {url: url, status: true|false}
 * @example
 *
 * // Scan URLs and print results
 * return lando.utils.scanUrls(['http://localhost', 'https://localhost'])
 * .then(function(results) {
 *   console.log(results);
 * });
 */
 /*
exports.scanUrls = function(urls, opts) {

  // Scan opts
  opts = {
    max: opts.max || 7,
    waitCodes: opts.waitCodes || [400, 502, 404]
  };

  // Log
  log.debug('Starting url scan with opts', opts);

  // Ping the sites for awhile to determine if they are g2g
  return Promise.map(urls, function(url) {

    // Do a reasonable amount of retries
    return Promise.retry(function() {

      // Log the attempt
      log.info('Checking to see if %s is ready.', url);

      // Send REST request.
      return new Promise(function(fulfill, reject) {

        // If URL contains a wildcard then immediately set fulfill with yellow
        // status
        if (_.includes(url, '*')) {
          return fulfill({url: url, status: true, color: 'yellow'});
        }

        // Make the actual request, lets make sure self-signed certs are OK
        rest.get(url, {rejectUnauthorized: false, followRedirects: false})

        // The URL is accesible
        .on('success', function() {
          log.verbose('%s is now ready.', url);
          fulfill({url: url, status: true, color: 'green'});
        })

        // Throw an error on fail/error
        .on('fail', function(data, response) {

          // Get the code
          var code = response.statusCode;

          // If we have a wait code try again
          if (_.includes(opts.waitCodes, code)) {
            log.debug('%s not yet ready with code %s.', url, code);
            reject({url: url, status: false, color: 'red'});
          }

          // If we have another code then we assume thing are ok
          else {
            log.debug('%s is now ready.', url);
            fulfill({url: url, status: true, color: 'green'});
          }

        })

        // Something else bad happened
        .on('error', reject);

      });

    }, {max: opts.max})

    // Catch any error and return an inaccesible url
    .catch(function(err) {
      log.verbose('%s is not accessible', url);
      log.debug('%s not accessible with error', url, err.message);
      return {url: url, status: false, color: 'red'};
    });

  })

  // Log and then return scan results
  .then(function(results) {
    log.debug('URL scan results', results);
    return results;
  });

};

// Add docker executables path to path to handle weird situations where
// the user may not have machine in their path
var pathString = (process.platform === 'win32') ? 'Path' : 'PATH';
var binPath = getDockerBinPath();
if (!_.startsWith(env[pathString], binPath)) {
  env[pathString] = [binPath, process.env[pathString]].join(path.delimiter);
}

/*
 * Helper to get location of docker bin directory
 */
/*
var getDockerBinPath = function() {
  switch (process.platform) {
    case 'darwin':
      return path.join('/Applications/Docker.app/Contents/Resources', 'bin');
    case 'linux':
      return path.join(getSysConfRoot(), 'bin');
    case 'win32':
      var programFiles = process.env.ProgramW6432 || process.env.ProgramFiles;
      return path.join(programFiles + '\\Docker\\Docker\\resources\\bin');
  }
};
*/

/*
 * Get docker compose binary path
 */
 /*
var getComposeExecutable = function() {

  // Get compose bin path
  var composePath = getDockerBinPath();
  var composeBin = path.join(composePath, 'docker-compose');

  // Return exec based on path
  switch (process.platform) {
    case 'darwin': return composeBin;
    case 'linux': return composeBin;
    case 'win32': return composeBin + '.exe';
  }

};
*/

/*
 * This should only be needed for linux
 */
 /*
var getDockerExecutable = function() {

  // Get docker bin path
  var dockerPath = getDockerBinPath();
  var dockerBin = path.join(dockerPath, 'docker');

  // Return exec based on path
  switch (process.platform) {
    case 'darwin': return dockerBin;
    case 'linux': return '/usr/bin/docker';
    case 'win32': return dockerBin + '.exe';
  }

};
*/
