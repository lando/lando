/**
 * Contains update warnings.
 *
 * @since 3.0.0
 * @fires pre-bootstrap
 * @module update
 */

'use strict';

// Modules
var _ = require('./node')._;
var cache = require('./cache');
var chalk = require('./node').chalk;
var config = require('./config');
var GitHubApi = require('github');
var lando = require('./lando')(config);
var log = require('./logger');
var os = require('os');
var Promise = lando.Promise;
var semver = require('./node').semver;
var updateCache = 'lando:updates';

// GitHub object
var github = new GitHubApi({Promise: Promise});

/*
 * Do some additional bootstrapping prep for our engine
 */
lando.events.on('pre-bootstrap', 1, function(config) {

  var version = config.version;
  var expires = _.get(cache.get(updateCache), 'expires', 0);

  // Return the latest release
  return Promise.try(function() {

    // Return the cached value if its fresh
    if (expires >= Math.floor(Date.now())) {
      return cache.get(updateCache);
    }

    // Check for releases
    else {

      // GitHub repo config
      var landoRepoConfig = {
        owner: 'lando',
        repo: 'lando',
        page: 1,
        'per_page': 1
      };

      // Log the attempt
      log.verbose('Checking for updates...');

      // This i promise you
      return github.repos.getReleases(landoRepoConfig)

      // Extract the version
      .then(function(data) {
        return {
          version: _.trimStart(_.get(data, 'data.[0].tag_name', version), 'v'),
          url: _.get(data, 'data.[0].html_url', ''),
          expires: Math.floor(Date.now()) + 3600000
        };
      })

      // Do the latest version thing
      .then(function(update) {
        cache.set(updateCache, update, {persist: true, ttl: 1});
        return update;
      })

      // Dont let an error here kill things
      .catch(function(err) {
        log.warn(err);
      });

    }
  })

  // Print a message if an update is available
  .then(function(latest) {
    if (semver.lt(version, latest.version)) {
      console.log(os.EOL);
      console.log(chalk.yellow('There is an update available!!!'));
      console.log(chalk.yellow('Install it to get the latest and greatest'));
      console.log(os.EOL);
      console.log(chalk.cyan('Updating helps us provide the best support'));
      console.log(chalk.green(latest.url));
      console.log(os.EOL);
    }
  });

});
