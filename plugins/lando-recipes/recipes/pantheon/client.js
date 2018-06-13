'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const Log = require('./../../../../lib/logger');
const Promise = require('./../../../../lib/promise');
const axios = require('axios');
const baseURL = 'https://terminus.pantheon.io/api/';

/*
 * Helper to make requests to pantheon api
 */
const pantheonRequest = (request, log, verb, pathname, data = {}, options = {}) => {
  // Log the actual request we are about to make
  log.info('Making %s request to %s', verb, pathname);
  log.debug('Request data: %j', data);
  log.debug('Request options: %j.', options);

  // Attempt the request and retry a few times
  return Promise.retry(() => request[verb](pathname.join('/'), data, options))
    .then(response => {
      log.verbose('Response recieved: %j.', response.data);
      return response.data;
    })
    .catch(err => Promise.reject(err));
};

/*
 * Creates a new api client instance.
 * @todo: add some validation around the session eg throw an error if we make a request
 * with a unauthorized client
 */
module.exports = class PantheonApiClient {
  constructor(log = new Log(), session = '', mode = 'node') {
    this.log = log;
    this.session = session;
    this.mode = mode;
    const headers = {'Content-Type': 'application/json'};
    // Add cookie if we are in node mode, otherwise assume its set upstream in the browser
    if (mode === 'node') headers.Cookie = 'X-Pantheon-Session=' + this.session.session;
    this.request = axios.create({baseURL, headers});
  };

  /*
   * Auth with pantheon and set the session
   */
  auth(token) {
    const self = this;
    const data = {machine_token: token, client: 'terminus'};
    const options = (this.mode === 'node') ? {headers: {'User-Agent': 'Terminus/Lando'}} : {};
    return pantheonRequest(axios.create({baseURL}), this.log, 'post', ['authorize', 'machine-token'], data, options)
    .then(data => new PantheonApiClient(self.log, data, self.mode));
  };

  /*
   * Get list of sites
   */
  getSites() {
    // Call to get user sites
    const pantheonUserSites = () => {
      const getSites = ['users', _.get(this.session, 'user_id'), 'memberships', 'sites'];
      return pantheonRequest(this.request, this.log, 'get', getSites)
      .then(sites => _.map(sites, (site, id) => _.merge(site, site.site)));
    };
    // Call to get org sites
    const pantheonOrgSites = () => {
      const getOrgs = ['users', _.get(this.session, 'user_id'), 'memberships', 'organizations'];
      return pantheonRequest(this.request, this.log, 'get', getOrgs)
      .map(org => {
        if (org.role !== 'unprivileged') {
          return pantheonRequest(this.request, this.log, 'get', ['organizations', org.id, 'memberships', 'sites'])
          .map(site => _.merge(site, site.site));
        }
      })
      .then(sites => _.flatten(sites));
    };
    // Run both requests
    return Promise.all([
      pantheonUserSites(),
      pantheonOrgSites(),
    ])
    // Combine, cache and all the things
    .then(sites => _.compact(_.sortBy(_.uniqBy(_.flatten(sites), 'name'), 'name')));
  };

 /*
  * Get full list of a sites environments
  */
  getSiteEnvs(site) {
    return pantheonRequest(this.request, this.log, 'get', ['sites', site, 'environments'])
    .then(envs => _.map(envs, (data, id) => _.merge({}, data, {id})));
  };

  /*
   * Get user data
   */
  getUser() {
    return pantheonRequest(this.request, this.log, 'get', ['users', _.get(this.session, 'user_id')]);
  };

  /*
   * Post our key
   */
  postKey(key) {
    const postKey = ['users', _.get(this.session, 'user_id'), 'keys'];
    const options = (this.mode === 'node') ? {headers: {'User-Agent': 'Terminus/Lando'}} : {};
    const data = _.trim(fs.readFileSync(key, 'utf8'));
    return pantheonRequest(this.request, this.log, 'post', postKey, JSON.stringify(data), options);
  };
};
