/**
 * Pantheon init method
 *
 * @name init
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var Promise = lando.Promise;
  var rest = lando.node.rest;
  var urls = require('url');

  // "Constants"
  var tokenCacheKey = 'init:auth:pantheon:tokens';
  var sessionCacheKey = 'init:auth:pantheon:session:';
  var sitesCacheKey = 'init:auth:pantheon:sites:';

  /*
   * Helper to get pantheon accounts
   */
  var pantheonAccounts = function() {

    // Start an account collector
    var accounts = [];

    // Get our list of tokens
    _.forEach(lando.cache.get(tokenCacheKey), function(token, name) {
      accounts.push({name: name, value: token});
    });

    // Add option to add another token if we have accounts
    if (!_.isEmpty(accounts)) {
      accounts.push({name: 'add a different token', value: 'more'});
    }

    // Return choices
    return accounts;

  };

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
      return lando.cache.get(sessionKey);
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
   * Get full list of sites
   */
  var pantheonSites = function(token) {

    // If we have a process cached sites list lets use that
    var sitesKey = sitesCacheKey + token;
    if (lando.cache.get(sitesKey)) {
      return lando.cache.get(sitesKey);
    }

    // Start with auth
    return Promise.all([
      pantheonUserSites(token),
      pantheonOrgSites(token)
    ])

    // Combine, cache and all the things
    .then(function(sites) {

      // Order up our sites
      sites = _.sortBy(_.flatten(sites), 'name');

      // Cache
      lando.cache.set(sitesKey, sites);

      // Return
      return sites;

    });

  };

  // List of additional options
  var options = {
    'pantheon-auth': {
      describe: 'Pantheon machine token or email of previously used token',
      string: true,
      interactive: {
        type: 'list',
        message: 'Choose a Pantheon account',
        choices: pantheonAccounts(),
        when: function() {
          return !_.isEmpty(pantheonAccounts());
        },
        weight: 600
      }
    },
    'pantheon-auth-machine-token': {
      interactive: {
        name: 'pantheon-auth',
        type: 'password',
        message: 'Enter a Pantheon machine token',
        when: function(answers) {
          var token = _.get(answers, 'pantheon-auth');
          return (!token || token === 'more');
        },
        weight: 601
      }
    },
    'pantheon-site': {
      describe: 'Pantheon site machine name',
      string: true,
      interactive: {
        type: 'list',
        message: 'Which site?',
        choices: function(answers) {

          // Token path
          var tpath = 'pantheon-auth';

          // Make this async cause we need to hit the terminus
          var done = this.async();

          // Get the pantheon sites using the token
          pantheonSites(_.get(lando.tasks.argv(), tpath, answers[tpath]))

          // Parse the sites into choices
          .map(function(site) {
            return {name: site.name, value: site.name};
          })

          // Done
          .then(function(sites) {
            done(null, sites);
          });

        },
        weight: 602
      }
    }
  };

  /**
   * Build out pantheon recipe
   */
  var build = function() {

    // Return the things
    return {};

  };

  // Return the things
  return {
    build: build,
    options: options
  };

};
