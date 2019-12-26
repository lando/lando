'use strict';

// Modules
const _ = require('lodash');
const Mailchimp = require('mailchimp-api-v3');
const utils = require('./../lib/utils');


/*
 * Work on mailchimp subscribers
 */
module.exports = (api, handler, config) => {
  // Get the mailchimp magix
  const mailchimp = new Mailchimp(config.LANDO_API_MAILCHIMP_KEY);

  // Add/update a subscriber
  api.put('/v1/subscribe', handler((req, res) => {
    // Throw error if we dont have an email
    if (!_.get(req, 'body.email', false)) {
      throw utils.makeError('Malformed email!', 422);
    }

    // Get and reconcile interests
    const groups = _.compact(_.flatten([req.body.alliance, req.body.devNetwork, req.body.personas]));
    return mailchimp.get('lists/613837077f/interest-categories').then(results => {
      return Promise.all(_(_.get(results, 'categories', []))
        .map(category => category.id)
        .map(id => mailchimp.get(`lists/613837077f/interest-categories/${id}/interests`))
        .value())
        .then(categories => _(categories)
          .map(category => category.interests)
          .flatten()
          .map(interest => ({name: interest.name, id: interest.id}))
        )
        .then(interests => _(interests)
          .filter(interest => _.includes(groups, interest.name))
          .map(interest => ([interest.id, true]))
          .fromPairs()
          .value()
        );
    })
    // Update the contact
    .then(interests => {
      return mailchimp.put(`/lists/613837077f/members/${utils.md5(req.body.email)}`, {
        email_address: req.body.email,
        interests,
        status: 'subscribed',
      });
    });
  }));
};
