'use strict';

// Modules
const utils = require('./../lib/utils');

// Class colors
const SUCCESS = '#2ecc71';
const WARNING = '#e7c000';
const ERROR = '#c00';

/*
 * Creates a new Cache instance.
 */
module.exports = class SlackNotify {
  constructor(apiKey, sponsorsKey) {
    this.apiChannel = require('slack-notify')(apiKey);
    this.sponsorChannel = require('slack-notify')(sponsorsKey);
  };

  /*
   * Notify about an invalid sponsorship request
   */
  apiError({code, message, body = {}} = {}) {
    this.apiChannel.send({
      attachments: [
        {
          fallback: 'An API error has occurred!',
          text: 'An API error has occurred!',
          color: ERROR,
          fields: [
            {title: 'code', value: code, short: true},
            {title: 'message', value: message, short: true},
            {title: 'body', value: JSON.stringify(body, null, 2), short: false},
          ],
        },
      ],
    });
  };

  /*
   * Notify about an invalid sponsorship request
   */
  unhandledSponsorshipRequest({body, headers} = {}) {
    this.sponsorChannel.send({
      attachments: [
        {
          fallback: 'Unhandled sponsorship request! Handling needs to be added here!',
          text: 'A sponsorship request has been made but the Lando API cannot handle it yet!',
          color: WARNING,
          mrkdwn_in: ['body', 'headers'],
          fields: [
            {title: 'body', value: JSON.stringify(body, null, 2), short: false},
            {title: 'headers', value: JSON.stringify(headers, null, 2), short: false},
          ],
        },
      ],
    });
  };

  /*
   * Notify about new sponsors
   */
  newSponsor(data = {}) {
    const message = {
      attachments: [
        {
          fallback: 'We good!',
          color: SUCCESS,
          author_name: data.name,
          author_icon: data.pic,
          text: `${data.username} ${data.action} a sponsorship at the ${data.level} level!`,
          fields: [
            {title: 'email', value: data.email, short: true},
            {title: 'level', value: data.level, short: true},
            {title: 'from', value: data.from, short: true},
            {title: 'username', value: data.username, short: true},
            {title: 'name', value: data.name, short: true},
            {title: 'public', value: data.public, short: true},
          ],
        },
      ],
    };

    // Customize the message if there is no email
    if (!data.email) {
      message.attachments[0].color = WARNING;
      message.attachments[0].text += ' But we can`t find an email for them! ' +
        'Get it and then add them to mailchimp manually!';
    }

    this.sponsorChannel.send(message);
  };

  /*
   * Notify about new subscribers
   */
  newSubscriber({email, groups = []} = {}) {
    this.apiChannel.send({
      attachments: [
        {
          fallback: 'We good!',
          color: SUCCESS,
          author_name: email,
          author_icon: `https://gravatar.com/avatar/${utils.md5(email)}`,
          text: `${email} subscribed to ${groups.join(', ')}`,
        },
      ],
    });
  };
};
