'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const Log = require('./../../../lib/logger');
const Promise = require('./../../../lib/promise');
const axios = require('axios');

// Set a limit on amount of sites
const MAX_SITES = 5000;

/*
 * Helper to collect relevant error data
 */
const getErrorData = (err = {}) => ({
  code: _.get(err, 'response.status', 200),
  codeText: _.get(err, 'response.statusText'),
  method: _.upperCase(_.get(err, 'response.config.method'), 'GET'),
  path: _.get(err, 'response.config.url'),
  response: _.get(err, 'response.data'),
});

/*
 * Helper to make requests to pantheon api
 */
const pantheonRequest = (request, log, verb, pathname, data = {}, options = {}) => {
  // Log the actual request we are about to make
  log.verbose('making %s request to %s', verb, `${_.get(request, 'defaults.baseURL')}${pathname.join('/')}`);
  log.debug('request sent data with %j', options, _.clone(data));

  // Attempt the request and retry a few times
  return Promise.retry(() => request[verb](pathname.join('/'), data, options)
    .then(response => {
      log.verbose('response recieved: %s with code %s', response.statusText, response.status);
      log.silly('response data', response.data);
      return response.data;
    })
    .catch(err => {
      const data = getErrorData(err);
      const msg = [
        `${data.method} request to ${data.path} failed with code ${data.code}: ${data.codeText}.`,
        `The server responded with the message ${data.response}.`,
      ];
      return Promise.reject(new Error(msg.join(' ')));
    }), {max: 2});
};

/*
 * Creates a new api client instance.
 * @todo: add some validation around the session eg throw an error if we make a request
 * with a unauthorized client
 * @todo: we can remove the mode from here and just extend this in other things
 */
module.exports = class PantheonApiClient {
  constructor(token = '', log = new Log(), mode = 'node') {
    this.baseURL = 'https://terminus.pantheon.io/api/';
    this.log = log;
    this.token = token;
    this.mode = mode;
  };

  /*
   * Auth with pantheon and set the session
   */
  auth(token = this.token) {
    const data = {machine_token: token, client: 'terminus'};
    const options = (this.mode === 'node') ? {headers: {'User-Agent': 'Terminus/Lando'}} : {};
    const upath = ['authorize', 'machine-token'];
    return pantheonRequest(axios.create({baseURL: this.baseURL}), this.log, 'post', upath, data, options)
    .then(data => {
      this.token = token;
      this.session = data;
      const headers = {'Content-Type': 'application/json'};
      // Add cookie if we are in node mode, otherwise assume its set upstream in the browser
      if (this.mode === 'node') headers.Cookie = `X-Pantheon-Session=${data.session}`;
      this.request = axios.create({baseURL: this.baseURL, headers});
      return data;
    });
  };

  /*
   * Get list of sites
   */
  getSites() {
    // Call to get user sites
    const pantheonUserSites = () => {
      const getSites = ['users', _.get(this.session, 'user_id'), 'memberships', 'sites'];
      return pantheonRequest(this.request, this.log, 'get', getSites, {params: {limit: MAX_SITES}})
      .then(sites => _.map(sites, (site, id) => _.merge(site, site.site)));
    };
    // Call to get org sites
    const pantheonOrgSites = () => {
      const getOrgs = ['users', _.get(this.session, 'user_id'), 'memberships', 'organizations'];
      return pantheonRequest(this.request, this.log, 'get', getOrgs)
      .map(org => {
        if (org.role !== 'unprivileged') {
          const getOrgsSites = ['organizations', org.id, 'memberships', 'sites'];
          return pantheonRequest(this.request, this.log, 'get', getOrgsSites, {params: {limit: MAX_SITES}})
          .map(site => _.merge(site, site.site));
        }
      })
      .then(sites => _.flatten(sites));
    };
    // Run both requests
    return Promise.all([pantheonUserSites(), pantheonOrgSites()])
    // Combine, cache and all the things
    .then(sites => _.compact(_.sortBy(_.uniqBy(_.flatten(sites), 'name'), 'name')))
    // Filter out any BAAAAD BIZZZNIZZZ
    .filter(site => !site.frozen);
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
