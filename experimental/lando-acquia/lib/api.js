'use strict';
// Modules
const axios = require('axios');
const _ = require('lodash');
const utils = require('./utils');

module.exports = class AcquiaApi {
  constructor(lando) {
    this.lando = lando;
    axios.defaults.baseURL = 'https://cloud.acquia.com/api/';
    this.authURL = 'https://accounts.acquia.com/api/auth/oauth/token';
    // this.apiURL = 'https://cloud.acquia.com/api';
    this.token = null;
    this.account = null;
    this.applications = null;
  }

  /**
   * Sets both token and account; Uses original values if called more than once.
   * @param {string} clientId Acquia client key
   * @param {string} clientSecret Acquia client secret
   * @param {bool} force Cache buster
   * @return {Promise}
   */
  auth(clientId, clientSecret, force = false) {
    // @see https://docs.acquia.com/cloud-platform/develop/api/auth/#making-api-calls-through-single-sign-on
    if (!force && this.token !== null) {
      return new this.lando.Promise(this.account);
    }
    // Clear account to assure the account on this object
    // matches the token if auth is run more than once.
    return axios.post(this.authURL, {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: '',
    })
      .then(res => {
        // Set token and auth headers
        this.token = res.data;
        axios.defaults.headers.common = {'Authorization': `Bearer ${this.token.access_token}`};
      })
      .catch(err => {
        throw err.response.data.error_description;
      }).then(() => {
        return this.getAccount().then(data => {
          this.account = data;
          return this.account;
        });
      });
  }

  /**
   * Sets this.applications
   * @return {Promise} Acquia applications array
   */
  getApplications() {
    if (this.applications !== null) {
      return new lando.Promise(this.applications);
    }
    return axios.get('https://cloud.acquia.com/api/applications').then(res => {
      const total = res.data.total;
      this.applications = total === 0 ? [] : res.data._embedded.items.map(item => ({
        id: item.id,
        uuid: item.uuid,
        subuuid: item.subscription.uuid,
        name: item.subscription.name,
      }));
      return this.applications;
    })
      .catch(error => {
        console.log(error);
      });
  }

  getEnvironments(appId) {
    return axios.get(`https://cloud.acquia.com/api/applications/${appId}/environments`).then(res => {
      const total = res.data.total;
      this.environments = total === 0 ? [] : res.data._embedded.items;
      const envs = [];
      _.each(this.environments, env => {
        if (env.name != 'prod') {
          envs.push({
            "name": env.name,
            "value": env.id
          })
        }
      });
      // Add in a none option.
      envs.push({"name": "none", "value": "none"});
      utils.writeEnvUuids(envs);
      return this.environments;
    })
      .catch(error => {
        console.log(error);
      });
  }

  /**
   * Sets this.account; Called in this.auth().
   * @return {Promise}
   */
  getAccount() {
    if (this.account !== null) {
      return new lando.Promise(this.account);
    }
    return axios.get('https://cloud.acquia.com/api/account').then(res => {
      this.account = res.data;
      return this.account;
    }).catch(error => {
      console.log(error);
    });
  }
};
