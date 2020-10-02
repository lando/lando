'use strict';

// Modules
const _ = require('lodash');
const {addSubscriber} = require('./../lib/subscribe');
const utils = require('./../lib/utils');

/*
 * Work on mailchimp subscribers
 */
module.exports = (api, handler, {config, slack}) => {
  // Add/update a subscriber
  api.put('/v1/subscribe', handler((req, res) => {
    // Throw error if we don't have an email
    if (!_.get(req, 'body.email', false)) {
      throw utils.makeError('Malformed email!', 422);
    }
    // Notify on slack
    slack.newSubscriber({email: _.toLower(req.body.email), groups: req.body.groups});
    // Get and reconcile interests
    return addSubscriber(
      config.LANDO_API_MAILCHIMP_KEY,
      req.body.email,
      req.body.groups,
      req.body.defaults
    );
  }));
};
