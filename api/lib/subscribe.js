'use strict';

// Modules
const _ = require('lodash');
const Mailchimp = require('mailchimp-api-v3');
const utils = require('./../lib/utils');

/*
 * Add or update a subscriber
 */
exports.addSubscriber = (key, email, groups = [], defaults = {}) => {
  const mailchimp = new Mailchimp(key);
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
    const lowerEmail = _.toLower(email);
    return mailchimp.put(`/lists/613837077f/members/${utils.md5(lowerEmail)}`, {
      email_address: lowerEmail,
      interests: _.merge({}, defaults, interests),
      status: 'subscribed',
    });
  });
};
