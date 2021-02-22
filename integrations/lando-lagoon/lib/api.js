'use strict';

// Modules
const _ = require('lodash');
const axios = require('axios');
const keys = require('./keys');
const utils = require('./utils');
const Promise = require('./../../../lib/promise');

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

/*
 * Creates a new api client instance.
 */
module.exports = class LagoonApi {
  constructor(key, lando) {
    const {keyPath, host, port} = keys.parseKey(key);
    this.key = keyPath;
    this.host = host;
    this.port = port;
    this.lando = lando;
    this.log = lando.log;

    // Computed things
    this.apiURL = `https://api.${this.host}`;
    this.sshURL = `ssh.${this.host}`;
    // Set defaults for baseURL
    this.axios = axios.create({baseURL: this.apiURL});

    // Cache of stuff
    this.projects = [];
  };

  auth() {
    this.log.verbose('Fetching token from %s:%s using %s', this.sshURL, this.port, this.key);
    return Promise.retry(() => {
      return utils.run(this.lando, `/helpers/lagoon-auth.sh ${this.sshURL} lagoon ${this.port}`, this.key)
        .then(token => {
          this.axios.defaults.headers.common = {'Authorization': `Bearer ${_.trim(token)}`};
        })
        .catch(message => {
          throw Error(message);
        });
      });
  };

  getProjects(refresh = false) {
    return !refresh && !_.isEmpty(this.projects) ? Promise.resolve(this.projects) :
      this.send(graphQueries.listProject).then(res => {
        this.projects = res.data.data.allProjects;
        return this.projects;
      });
  }

  getProject(name) {
    if (_.isEmpty(this.projects)) {
      return this.getProjects().then(() => this.getProject(name));
    }
    return Promise.resolve(this.projects.find(project => project.name === name));
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
    return this.axios({url: '/graphql', method: 'post', data: {query}})
      .then(res => res)
      .catch(err => {
        const data = getErrorData(err);
        // Refresh token and try once more if response is a 403.
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
