'use strict';

// Modules
const _ = require('lodash');
const crypto = require('crypto');
const path = require('path');
const {addSubscriber} = require('./../lib/subscribe');
const utils = require('./../lib/utils');
const {Octokit} = require('@octokit/rest');
const Promise = require('bluebird');

// Data
const sponsorsFile = path.resolve(__dirname, '..', 'data', 'sponsors.yml');

// Constants
const DEFAULT_RESPONSE = {
  body: {},
  code: 403,
  action: null,
  email: null,
  from: null,
  level: 'hero',
  message: 'Unauthenticated request!',
  public: false,
  signature: false,
  username: null,
  validated: false,
};

// Helper to get level from cents
const getLevelFromCents = (cents = 400) => {
  if (cents < 900) return 'hero';
  if (cents >= 900 && cents < 9900) return 'herald';
  if (cents >= 9900 && cents < 99900) return 'ally';
  if (cents >= 99900 && cents < 177600) return 'partner';
  if (cents >= 177600) return 'patriot';
};

// GitHub things
// @TODO: get these in to their own files at some point
const verifyGitHubSignature = (req = {}, secret = '') => {
  const sig = _.get(req.headers, 'x-hub-signature', null);
  const hmac = crypto.createHmac('sha1', secret);
  const digest = Buffer.from('sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
  const checksum = Buffer.from(sig, 'utf8');
  if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
    return false;
  } else {
    return true;
  }
};

/*
 * Retrieve contributors
 */
module.exports = (api, handler, {config, slack}) => {
  // Configure things as needed
  const octokit = new Octokit({auth: config.LANDO_API_GITHUB_TOKEN});

  // Get all sponsors
  api.get('/v1/sponsors', handler((req, res) => {
    return utils.loadFile(sponsorsFile) || [];
  }));
  // Get sponsors by type
  api.get('/v1/sponsors/:type', handler((req, res) => {
    return _.filter(utils.loadFile(sponsorsFile), {type: req.params.type});
  }));

  // Add a sponsor
  api.post('/v1/sponsor', handler((req, res) => {
    // Start with the default response body
    const response = _.merge({}, DEFAULT_RESPONSE, {body: _.get(req, 'body', {})});

    // Analyze headers to determine source
    // @TODO: eventually we probably want a more abstract system here
    if (_.get(req, 'headers.x-github-event', false) === 'sponsorship') {
      response.from = 'github';
    }

    // Analyze headers to validate source and supported actions
    if (response.from === 'github') {
      response.signature = verifyGitHubSignature(req, config.LANDO_API_GITHUB_SECRET);
      response.action = _.get(req, 'body.action', null);
      // response.validated = response.signature && _.includes(['created'], response.action);
      // @TODO: Ignore signature validattion above until we complete the backlog
      response.validated = true && _.includes(['created'], response.action);
    }

    // If invalid response then let's send to slack and return right here
    if (!response.validated) {
      slack.unhandledSponsorshipRequest(req);
      const err = new Error(response.message);
      err.code = 403;
      return Promise.reject(err);
    }

    // Parse body to get relevant data we need
    return Promise.resolve(req.body).then(body => {
      if (response.from === 'github') {
        // Get the easy things first
        response.public = _.get(body, 'sponsorship.privacy_level', false);
        response.level = getLevelFromCents(_.get(body, 'sponsorship.tier.monthly_price_in_cents', 400));
        response.username = _.get(body, 'sponsorship.sponsor.login', 'pirog');
        // Finally try to get the email
        return octokit.users.getByUsername({username: response.username})
        .then(raw => {
          // Try to get the email if its public
          response.email = _.get(raw, 'data.email', null);
          response.name = _.get(raw, 'data.name', null);
          response.pic = _.get(raw, 'data.avatar_url', 'https://docs.lando.dev/images/hero-pink.png');
          // If it is then we are good!
          if (!_.isNil(response.email)) return response;
          // Otherwise we need to do more to try and get dat email
          return octokit.request(`GET /users/${response.username}/events/public`)
          .then(raw => {
            const data = _(_.get(raw, 'data', []))
              .filter(event => event.type = 'PushEvent')
              .filter(event => _.has(event, 'payload.commits'))
              .map(event => event.payload.commits)
              .flatten()
              .filter(commit => _.has(commit, 'author.name'))
              .filter(commit => commit.author.name === response.name)
              .value();
            response.email = _.get(data, '[0].author.email', null);
            return response;
          });
        });
      } else {
        return Promise.resolve(response);
      }
    })
    .then(response => {
      // Slack the things
      slack.newSponsor(response);
      // Try to add them to mailchimp if we have an email
      return Promise.resolve().then(() => {
        if (response.email) {
          return addSubscriber(
            config.LANDO_API_MAILCHIMP_KEY,
            response.email,
            ['NEWSLETTER', 'SPONSOR', _.toUpper(response.level)],
            {
              '36113a4526': false,
              '2abe119d23': false,
              'f020990e25': false,
              '4a81e85359': false,
              'f63decb94d': false,
              '20270ed04e': false,
              '8a2f0956f5': false,
            }
          );
        }
      })
      // Finish up
      .then(() => ({message: 'succcess!'}));
    });
  }));
};
