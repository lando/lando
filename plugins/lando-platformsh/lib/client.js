'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const Log = require('./../../../lib/logger');
const Promise = require('./../../../lib/promise');
const axios = require('axios');

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
 * Helper to make requests to platformsh api
 */
const platformshRequest = (request, log, verb, pathname = '', data = {}, options = {}) => {
  // Log the actual request we are about to make
  log.info('Making %s request to %s', verb, pathname);
  log.debug('Request data: %j', data);
  log.debug('Request options: %j.', options);

  // Attempt the request and retry a few times
  const path = Array.isArray(pathname) ? pathname.join('/') : pathname;
  return Promise.retry(() => request[verb](path, data, options)
    .then(response => {
      log.verbose('Response received: %j.', response.data);
      return response.data;
    })
    .catch(err => {
      const data = getErrorData(err);
      let msg = '';
      if (data && data.response) {
        msg = [
          `${data.method} request to ${data.path} failed with code ${data.code}: ${data.codeText}.`,
          `The server responded with the message ${data.response.Message}.`,
        ];
      }
      return Promise.reject(new Error(msg.join(' ')));
    }), {max: 2});
};

/*
 * Creates a new api client instance.
 * @todo: add some validation around the session eg throw an error if we make a request
 * with a unauthorized client
 * @todo: we can remove the mode from here and just extend this in other things
 */
module.exports = class PlatformshApiClient {
  constructor(token = '', log = new Log()) {
    this.baseURL = 'https://api.platform.sh/';
    this.request = null;
    this.accountsUrl = 'https://accounts.platform.sh/';
    this.log = log;
    this.token = token;
    // {access_token: 'abc123', expires_at': [unixtime seconds], 'headers': {'Authorization...':'123'}}
    this.session = null;
  };

  /*
   * Auth with platformsh and set the session
   */
  auth(token = this.token) {
    // Use existing session if already authenticated.
    if (!this.isAuthenticated(token)) {
      this.token = token;
      const data = {client_id: 'platform-api-user', grant_type: 'api_token', api_token: token};
      const upath = ['oauth2', 'token'];
      const options = {headers: {'Content-Type': 'application/json'}};
      return platformshRequest(axios.create({baseURL: this.accountsUrl}), this.log, 'post', upath, data, options)
        .then(data => {
          return this.setSession(data);
        })
        .catch(data => {
        });
    }
    return new Promise(() => this.session);
  };

  isAuthenticated(token) {
    return token === this.token && this.session && new Date().getTime() / 1000 <= this.session.expires_at;
  }

  setSession(data) {
    this.session = {
      access_token: data.access_token,
      expires_at: new Date().getTime() / 1000 + parseInt(data.expires_in),
      headers: {
        'Authorization': 'Bearer ' + data.access_token,
        'Content-Type': 'application/json',
      },
    };
    this.request = axios.create({baseURL: this.baseURL, headers: this.session.headers});
    this.accountsRequest = axios.create({baseURL: this.accountsUrl, headers: this.session.headers});
    return this.session;
  }

  /*
   * Get list of sites
   */
  getSites() {
    return platformshRequest(this.request, this.log, 'get', ['projects'])
      .then(res => res.projects)
      .map(p => {
        return platformshRequest(
          this.request,
          this.log,
          'get',
          ['projects', p.id])
          // Add the subscription_id from the project collection value to the unique project request
          .then(pp => {
            pp.subscription_id = p.subscription_id;
            return pp;
          });
      });
  };

  /*
   * Get subscription
   */
  getSubscription(subid) {
    const path = ['api', 'v1', 'subscriptions', subid];
    return platformshRequest(this.accountsRequest, this.log, 'get', path);
  };

  /*
   * Get full list of a sites environments
   */
  getSiteEnvs(site) {
    return platformshRequest(this.request, this.log, 'get', ['projects', site, 'environments'])
      .then(envs => _.map(envs, (data, id) => _.merge({}, data, {id})));
  };

  /*
   * Get user data
   */
  getUser() {
    return platformshRequest(this.request, this.log, 'get', ['me']);
  };

  /*
   * Get SSH Key
   */
  getKey(key) {
    key = _.trim(fs.readFileSync(key, 'utf8'));
    return platformshRequest(this.request, this.log, 'get', ['ssh_keys', key]);
  };

  /*
   * Post our key
   */
  postKey(key, uuid) {
    const postKey = ['ssh_keys'];
    const options = (this.mode === 'node') ? {headers: {'User-Agent': 'Lando'}} : {};
    const data = {
      value: _.trim(fs.readFileSync(key, 'utf8')),
      title: 'lando-auto-generated',
      uuid: uuid,
    };
    return platformshRequest(this.request, this.log, 'post', postKey, JSON.stringify(data), options);
  };
};
