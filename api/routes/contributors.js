'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const utils = require('./../lib/utils');

// Data
const contributorsFile = path.resolve(__dirname, '..', 'data', 'contributors.yml');

// Helper to get roles
const getRoles = role => {
  switch (role) {
    case 'administrators':
      return ['administrator'];
    case 'bloggers':
      return ['content'];
    case 'contributors':
      return ['code', 'devops', 'documentation', 'issues', 'support'];
    case 'evangelists':
      return ['evangelism', 'events', 'meetups', 'outreach', 'training'];
    case 'guiders':
      return ['guides and tutorials'];
    case 'sponsors':
      return ['sponsor'];
    case 'upsellers':
      return ['upseller'];
    default:
      return [];
  };
};

// Lowercase all
const lca = list => _(list).map(item => _.lowerCase(item)).value();

/*
 * Retrieve contributors
 */
module.exports = (api, handler) => {
  // All contributors
  api.get('/v1/alliance', handler((req, res) => {
    return utils.loadFile(contributorsFile) || [];
  }));

  // Contributors by alliance role
  api.get('/v1/alliance/:role', handler((req, res) => {
    const roles = getRoles(req.params.role);
    roles.push('everything');
    return _(utils.loadFile(contributorsFile))
      .filter(person => !_.isEmpty(_.intersection(roles, lca(person.role))))
      .values();
  }));
};


