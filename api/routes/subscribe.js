const _ = require('lodash');
const Mailchimp = require('mailchimp-api-v3');
const utils = require('./../lib/utils');

/*
{
  "email_address": "mike+testapi@lando.dev",
  "status_if_new": "subscribed",
  "interests": {
    "2abe119d23": true
  }
}
*/

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

    // Update the stuff
    return mailchimp.put(`/lists/613837077f/members/${utils.md5(req.body.email)}`, {
      email_address: req.body.email,
      status: 'subscribed',
    })
    .then(results => results);
  }));
};
