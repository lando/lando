'use strict';

// Modules
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Promise = require('./../../../lib/promise');
const axios = require('axios');
const utils = require('./utils');

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
        }
      }
    }`,
  whoami: `
    query {
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

/*
 * Creates a new api client instance.
 */
module.exports = class LagoonApi {
  constructor(key = {}, lando) {
    this.key = key;
    this.lando = lando;
    this.log = lando.log;
    this.tokenFile = path.join(lando.config.userConfRoot, 'keys', `${key.id}.token`);
    this.token = null;
    this.projects = null;
    // Setup axios
    axios.defaults.baseURL = key.url;
    // Set this.token and axios Authorization headers
    this.setTokenFromFile();
  };

  getProjects(refresh = false) {
    return !refresh && this.projects !== null ? this.projects : this.send(graphQueries.listProject);
  }

  getProject(id) {
    if (this.projects === null) {
      this.getProjects().then(() => {
        return this.getProject(id);
      });
    }
    return _.find(this.projects, project => id === project.id);
  }

  whoami() {
    return this.send(graphQueries.whoami);
  }

  send(query, finalTry = false) {
    this.log.verbose('Lagoon request:%s - payload: %s', this.key.url, query);
    return axios({url: '/graphql', method: 'post', data: {query}})
      .then(res => {
        this.log.verbose(res.data.data.allProjects);
        this.projects = res.data.data.allProjects;
        return this.projects;
      })
      .catch(err => {
        const data = getErrorData(err);
        // Refresh token and try once more if response is a 403.
        if (!finalTry && data.code >= 400) {
          this.log.verbose('Lagoon request unauthorized; Refreshing token and trying again...');
          return this.refreshToken().then(res => {
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
        // @NOTE: it's not clear to me why we make this into a message instead of passing through
        // the entire data object, possibly the reason has been lost to the wind of change.
        return Promise.reject(new Error(msg.join(' ')));
      });
  }

  refreshToken() {
    this.log.verbose('Refreshing token');
    return utils.landoRun(
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
};

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
