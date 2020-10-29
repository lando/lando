'use strict';

// Modules
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Promise = require('./../../../lib/promise');
const axios = require('axios');
const utils = require('./utils');
const keys = require('./keys');

const graphQueries = {
  listProject: `
    query list_projects {
      allProjects {
        id
        gitUrl
        name
        branches
        pullrequests
        productionEnvironment
        environments {
          name
          environmentType
          openshiftProjectName
        }
      }
    }`,
  whoami: `
    query whoami {
      me {
        id
        email
        firstName
        lastName
        sshKeys {
          id
          name
          keyType
          keyValue
          keyFingerprint
          created
        }
      }
    }`,
};

// Global so we can return the same object if already instantiated.
let Api = null;

// First call requires key and lando object.
exports.getLagoonApi = (keyId = null, lando = null) => {
  if (Api !== null) {
    return Api;
  }
  if (keyId === null || lando === null) {
    throw new Error('Cannot get lagoonApi for the first time without key and lando');
  }
  return new LagoonApi(keyId, lando);
};

/*
 * Creates a new api client instance.
 */
class LagoonApi {
  constructor(keyId, lando) {
    const keyCache = keys.getCachedKeys(lando);
    this.key = _.find(keyCache, key => key.id === keyId);
    this.lando = lando;
    this.log = lando.log;
    this.tokenFile = path.join(lando.config.userConfRoot, 'keys', `${this.key.id}.token`);
    this.token = null;
    this.projects = null;
    // Setup axios
    axios.defaults.baseURL = this.key.url;
    // Set this.token and axios Authorization headers
    this.setTokenFromFile();
  };

  getProjects(refresh = false) {
    return !refresh && this.projects ? this.projects :
      this.send(graphQueries.listProject).then(res => {
        this.projects = res.data.data.allProjects;
        return this.projects;
      });
  }

  getProject(name) {
    if (this.projects === null) {
      return this.getProjects().then(() => {
        return this.getProject(name);
      });
    }
    return this.projects.find(project => project.name === name);
  }

  getEnvironments(name) {
    return this.getProject(name).then(project => {
      return project.environments ? project.environments : [];
    });
  }

  whoami() {
    return this.send(graphQueries.whoami)
      .then(res => res.data.data.me);
  }

  send(query, finalTry = false) {
    this.log.verbose('Lagoon request:%s - payload: %s', this.key.url, query);
    return axios({url: '/graphql', method: 'post', data: {query}})
      .then(res => res)
      .catch(err => {
        const data = getErrorData(err);
        // Refresh token and try once more if response is a 403.
        if (!finalTry && data.code >= 400) {
          this.log.verbose('Lagoon request unauthorized; Refreshing token and trying again...');
          return this.refreshToken()
            .then(res => {
              // Set token with latest from token file.
              this.setTokenFromFile();
              // Run the request once more.
              return this.send(query, true);
            });
        }

        const msg = [
          `${data.method} request to ${data.path} failed with code ${data.code}: ${data.codeText}.`,
          `The server responded with the message ${data.response}.`,
        ];
        this.log.verbose('Lagoon request failed: %s', msg);
        // @NOTE: it's not clear to me why we make this into a message instead of passing through
        // the entire data object, possibly the reason has been lost to the wind of change.
        return Promise.reject(new Error(msg.join(' ')));
      });
  }

  refreshToken() {
    this.log.verbose('Refreshing token');
    return utils.run(
      this.lando,
      // eslint-disable-next-line max-len
      `/helpers/lagoon-refresh-token.sh ${this.key.id} ${this.key.user} ${this.key.host} ${this.key.port} ${this.key.url}`
    );
  };

  setTokenFromFile() {
    axios.defaults.headers.common = {};
    if (fs.existsSync(this.tokenFile)) {
      this.token = fs.readFileSync(this.tokenFile).toString().trim();
      axios.defaults.headers.common = {'Authorization': `Bearer ${this.token}`};
    }
  }
}

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
