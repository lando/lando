'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var path = require('path');
  var Promise = lando.Promise;
  var rest = lando.node.rest;
  var urls = require('url');

  // "Constants"
  var tokenCacheKey = 'init:auth:pantheon:tokens';
  var sessionCacheKey = 'init:auth:pantheon:session:';
  var sitesCacheKey = 'init:auth:pantheon:sites:';
  var envCacheKey = 'init:auth:pantheon:site:envs:';

  /*
   * Return auth headers we need for session protected endpoints
   */
  var getAuthHeaders = function(session) {
    return {
      'Content-Type': 'application/json',
      'Cookie': 'X-Pantheon-Session=' + session.session,
      'User-Agent': 'Terminus/Lando'
    };
  };

  /*
   * Helper to make requests to pantheon api
   */
  var pantheonRequest = function(verb, pathname, data, options) {

    // Target
    var target = {
      protocol: 'https',
      hostname: 'terminus.pantheon.io',
      port: '443'
    };

    // Prepend the pathname
    pathname.unshift('api');

    // Log the actual request we are about to make
    lando.log.info('Making %s request to %s', verb, pathname);
    lando.log.debug('Request data: %j', data);
    lando.log.debug('Request options: %j.', options);

    // Build the request
    var request = _.merge(target, {pathname: pathname.join('/')});

    // Attempt the request and retry a few times
    return Promise.retry(function() {

      // Send REST request.
      return new Promise(function(fulfill, reject) {

        // Make the actual request
        rest[verb](urls.format(request), data, options)

        // Log result and fulfil promise
        .on('success', function(data) {
          lando.log.debug('Response recieved: %j.', data);
          fulfill(data);
        })

        // Throw an error on fail/error
        .on('fail', function(data) {
          var err = new Error(data);
          reject(err);
        }).on('error', reject);

      });

    });

  };

  /*
   * Auth with pantheon directly
   */
  var pantheonAuth = function(token) {

    // Check to see if token is cached already and use that
    var tokens = lando.cache.get(tokenCacheKey) || {};
    if (_.includes(_.keys(tokens), token)) {
      token = tokens[token];
    }

    // If we have a process cached token lets use that
    var sessionKey = sessionCacheKey + token;
    if (lando.cache.get(sessionKey)) {
      return Promise.resolve(lando.cache.get(sessionKey));
    }

    // Request deets
    var endpoint = ['authorize', 'machine-token'];
    var data = {'machine_token': token, client: 'terminus'};
    var options = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Terminus/Lando'
      }
    };

    // Send REST request.
    return pantheonRequest('postJson', endpoint, data, options)

    // Use the session to get information about the user
    .then(function(session) {

      // RThe user get path
      var getUser = ['users', _.get(session, 'user_id')];

      // Get more user info
      return pantheonRequest('get', getUser, {headers: getAuthHeaders(session)})

      // Add our token to the cache
      .then(function(user) {

        // Get the email from the user
        var email = _.get(user, 'email');

        // Log
        lando.log.info('Got session: %j for user %s', session, email);

        // Persistenly cache token
        tokens[email] = token;
        lando.cache.set(tokenCacheKey, tokens, {persist: true});

        // Process cache the session
        lando.cache.set(sessionKey, session);

      })

      // Return the session
      .then(function() {
        return session;
      });

    });

  };

  /*
   * Get full list of org sites
   */
  var pantheonOrgSites = function(token) {

    // Start with auth
    return pantheonAuth(token)

    // Get the sites
    .then(function(session) {

      // Headers options
      var options = {headers: getAuthHeaders(session)};

      // Get org path
      var userId = _.get(session, 'user_id');
      var getOrgs = ['users', userId, 'memberships', 'organizations'];

      // Get the orgs
      return pantheonRequest('get', getOrgs, options)

      // Map each org into sites
      .map(function(org) {

        // If the role make sense get the sites
        if (org.role !== 'unprivileged') {
          var orgSites = ['organizations', org.id, 'memberships', 'sites'];
          return pantheonRequest('get', orgSites, options)
          .map(function(site) {
            var data = site.site;
            data.id = site.id;
            return data;
          });
        }
      })

      // Flatten the sites
      .then(function(sites) {
        return _.flatten(sites);
      });

    });

  };

  /*
   * Get full list of users sites
   */
  var pantheonUserSites = function(token) {

    // Start with auth
    return pantheonAuth(token)

    // Get the sites
    .then(function(session) {
      var getSites = ['users', _.get(session, 'user_id'), 'sites'];
      var options = {headers: getAuthHeaders(session)};
      return pantheonRequest('get', getSites, options);
    })

    // Map them into something we can merge with org sites better
    .then(function(sites) {
      return _.map(sites, function(site, id) {
        var data = site.information;
        data.id = id;
        return data;
      });
    });

  };

  /*
   * Post our key
   */
  var pantheonPostKey = function(token) {

    // Start with auth
    return pantheonAuth(token)

    // Get the sites
    .then(function(session) {
      var postKey = ['users', _.get(session, 'user_id'), 'keys'];
      var keyFile = 'pantheon.lando.id_rsa.pub';
      var keyPath = path.join(lando.config.userConfRoot, 'keys', keyFile);
      var data = _.trim(fs.readFileSync(keyPath, 'utf8'));
      var options = {headers: getAuthHeaders(session)};
      return pantheonRequest('postJson', postKey, data, options);
    });

  };

  /*
   * Get full list of sites
   */
  var pantheonSites = function(token) {

    // Check to see if token is cached already and use that
    var tokens = lando.cache.get(tokenCacheKey) || {};
    if (_.includes(_.keys(tokens), token)) {
      token = tokens[token];
    }

    // If we have a process cached sites list lets use that
    var sitesKey = sitesCacheKey + token;
    if (lando.cache.get(sitesKey)) {
      return Promise.resolve(lando.cache.get(sitesKey));
    }

    // Start with auth
    return Promise.all([
      pantheonUserSites(token),
      pantheonOrgSites(token)
    ])

    // Combine, cache and all the things
    .then(function(sites) {

      // Clean things up
      sites = _.compact(_.sortBy(_.uniqBy(_.flatten(sites), 'name'), 'name'));

      // Cache
      lando.cache.set(sitesKey, sites);

      // Return
      return sites;

    });

  };

  /*
   * Get full list of a sites environments
   */
  var pantheonSiteEnvs = function(token, site) {

    // If we have a process cached env list lets use that first
    var envKey = envCacheKey + site;
    if (lando.cache.get(envKey)) {
      return Promise.resolve(lando.cache.get(envKey));
    }

    // Start with auth
    return pantheonAuth(token)

    // Get the envs
    .then(function(session) {
      var getSites = ['sites', site, 'environments'];
      var options = {headers: getAuthHeaders(session)};
      return pantheonRequest('get', getSites, options);
    })

    // Map them into something we can merge with org sites better
    .then(function(envs) {
      return _.map(envs, function(data, id) {
        data.id = id;
        return data;
      });
    });

  };

  // Return the things
  return {
    getSites: pantheonSites,
    getEnvs: pantheonSiteEnvs,
    postKey: pantheonPostKey
  };

};
