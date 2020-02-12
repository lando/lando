'use strict';

// Modules
const _ = require('lodash');
const crypto = require('crypto');
const event = require('./../lib/event');
const LandoApiClient = require('./../lib/api');

module.exports = lando => {
  // Get the API
  const api = new LandoApiClient(lando.log);
  // Get the authors
  const authors = _.map(api.read('contributors'), author => ({name: author.name, value: author.id}));
  authors.unshift({name: 'Team Lando', value: 'Team Lando'});

  return {
    command: 'event:add',
    level: 'tasks',
    describe: 'Adds a new Lando event',
    options: event.addOptions(authors),
    run: options => {
      // Build The basic data
      const seed = `${options.url}${options.name}${options.presenter}${options.date}`;
      const data = _.merge({}, {
        id: `${crypto.createHash('md5').update(seed).digest('hex')}`,
        presenter: 'Team Lando',
        presenterPic: 'https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd',
        presenterLink: 'https://twitter.com/devwithlando',
      }, _.omitBy(_.omit(options, ['_', '_app', '$0', 'verbose', 'v']), _.isEmpty));

      // Replace author data if we have it
      if (data.presenter !== 'Team Lando') {
        const presenter = _.first(api.read('contributors', {id: data.presenter}));
        data.presenter = presenter.name;
        data.presenterPic = presenter.pic;
        data.presenterLink = presenter.twitter
          ? `https://twitter.com/${presenter.twitter}` : `https://github.com/${presenter.github}`;
      }

      // Add to the events
      console.log('Added the following event');
      console.log(lando.cli.formatData(api.update('events', data, [['date'], ['desc']]), {format: 'table'}));
    },
  };
};
