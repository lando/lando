'use strict';

// Modules
var _ = require('lodash');
var GitHubApi = require('github');
var Promise = require('./promise');
var semver = require('semver');

module.exports = class UpdateManager {
  constructor() {
    this.githubApi = new GitHubApi({Promise: Promise});
  };

  /**
   * Compares two versions and determines if an update is available or not
   *
   * @since 3.0.0
   * @alias 'lando.updates.updateAvailable'
   * @param {String} version1 - The current version.
   * @param {String} version2 - The potential update version
   * @return {Boolean} Whether an update is avaiable.
   * @example
   *
   * // Does our current version need to be updated?
   * var updateAvailable = lando.updates.updateAvailable('1.0.0', '1.0.1');
   */
  static updateAvailable(version1, version2) {
    return semver.lt(version1, version2);
  };

  /**
   * Determines whether we need to fetch updatest or not
   *
   * @since 3.0.0
   * @alias 'lando.updates.fetch'
   */
  static fetch(data) {

    // Return true immediately if update is undefined
    if (!data) {
      return true;
    }

    // Else return based on the expiration
    return !(data.expires >= Math.floor(Date.now()));

  };

  /**
   * Get latest version info from github
   *
   * @since 3.0.0
   * @alias 'lando.updates.refresh'
   */
  refresh(version) {

    // GitHub repo config
    var landoRepoConfig = {
      owner: 'lando',
      repo: 'lando',
      page: 1,
      'per_page': 10
    };

    // This i promise you
    return this.githubApi.repos.getReleases(landoRepoConfig)

    // Extract and return the metadata
      .then(function(data) {

        // Get the latest non-draft/non-prerelease version
        data = _.find(_.get(data, 'data', []), function(release) {
          return (release.draft === false && release.prerelease === false);
        });

        // Return the update data
        return {
          version: _.trimStart(_.get(data, 'tag_name', version), 'v'),
          url: _.get(data, 'html_url', ''),
          expires: Math.floor(Date.now()) + 86400000
        };
      })

      // Don't let an error here kill things
      .catch(function() {
        return {
          version: _.trimStart(version, 'v'),
          url: '',
          expires: Math.floor(Date.now()) + 86400000
        };
      });

  };
};
