'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var path = require('path');
  var Promise = lando.Promise;
  var axios = lando.node.axios;

  // "Constants"
  var tokenCacheKey = 'init.auth.pantheon.tokens';
  var sessionCacheKey = 'init.auth.pantheon.session.';
  var sitesCacheKey = 'init.auth.pantheon.sites.';
  var envCacheKey = 'init.auth.pantheon.site.envs.';

  /*
   * Return auth headers we need for session protected endpoints
   * If Lando is running in a browser we expect it will be set upstream
   */
  var getAuthHeaders = function(session) {
    return (lando.config.process === 'node') ? {'Cookie': 'X-Pantheon-Session=' + session.session} : {};
  };

  /*
   * Helper to make requests to pantheon api
   */
  const pantheonRequest = (verb, pathname, data = {}, options = {}) => {
    // Build our request client
    const request = axios.create({
      baseURL: 'https://terminus.pantheon.io/api/',
      headers: {'Content-Type': 'application/json'},
    });

    // Log the actual request we are about to make
    lando.log.info('Making %s request to %s', verb, pathname);
    lando.log.debug('Request data: %j', data);
    lando.log.debug('Request options: %j.', options);

    // Attempt the request and retry a few times
    return Promise.retry(() => request[verb](pathname.join('/'), data, options))
      .then(response => {
        lando.log.debug('Response recieved: %j.', response.data);
        return response.data;
      })
      .catch(function(err) {
        return Promise.reject(err);
      });
  };

  /*
   * Auth with pantheon and get a session
   */
  var pantheonSession = function(token) {
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
    // Eventually set this to lando.config.userAgent;
    var options = (lando.config.process === 'node') ? {headers: {'User-Agent': 'Terminus/Lando'}} : {};

    // Send REST request.
    return pantheonRequest('post', endpoint, data, options);
  };

  /*
   * Auth with pantheon and get user data
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

    return pantheonSession(token)
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
            return _.merge(site, site.site);
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

      // Headers options
      var options = {headers: getAuthHeaders(session)};

      // Get org path
      var userId = _.get(session, 'user_id');
      var getSites = ['users', userId, 'memberships', 'sites'];

      // Get the sites
      return pantheonRequest('get', getSites, options);

    })

    // Map them into something we can merge with org sites better
    .then(function(sites) {
      return _.map(sites, function(site, id) {
        return _.merge(site, site.site);
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
      var keyPath = path.join(lando.config.userConfRoot, 'keys', 'pantheon.lando.id_rsa.pub');
      var data = _.trim(fs.readFileSync(keyPath, 'utf8'));
      return pantheonRequest('post', postKey, JSON.stringify(data), {headers: getAuthHeaders(session)});
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
    getSession: pantheonSession,
    getSites: pantheonSites,
    getEnvs: pantheonSiteEnvs,
    postKey: pantheonPostKey
  };

};
