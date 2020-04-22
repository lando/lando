'use strict';

// Modules
const _ = require('lodash');
const dayjs = require('dayjs');

// Things the contributor helps with
const eventTypes = [
  {name: 'Conference, National, 500+ people', value: 'conference'},
  {name: 'Camp, Regional, 100+ people', value: 'camp'},
  {name: 'Meetup, Local, 10+ people', value: 'meetup'},
  {name: 'Other', value: 'other'},
];

// Options for adding a contrib
exports.addOptions = authors => ({
  name: {
    describe: 'Event name',
    string: true,
    interactive: {
      type: 'input',
      message: 'Event name?',
      default: 'My Event',
    },
  },
  presenter: {
    describe: 'Event presenter',
    string: true,
    choices: authors,
    interactive: {
      type: 'list',
      message: 'Featuring?',
      default: 'Team Lando',
      choices: authors,
    },
  },
  date: {
    describe: 'Event date',
    string: true,
    interactive: {
      type: 'input',
      message: 'Event date (use format YYYY-MM-DD)',
      default: dayjs().format('YYYY-MM-DD'),
      filter: input => dayjs(input).format('YYYY-MM-DD'),
      validate: input => {
        return (dayjs(input).isValid()) ? true : 'Enter a valid date';
      },
    },
  },
  summary: {
    describe: 'Event summary',
    string: true,
    interactive: {
      type: 'input',
      default: 'A longer and SEO dense summary',
      message: 'Event summary?',
      validate: input => {
        if (_.size(input) > 280) return 'Must be 280 characters or less!';
        return true;
      },
    },
  },
  type: {
    describe: 'Event Type',
    array: true,
    alias: ['t'],
    choices: eventTypes,
    interactive: {
      type: 'list',
      default: 'meetup',
      message: 'Event type or size',
      choices: eventTypes,
    },
  },
  location: {
    describe: 'Event location',
    string: true,
    interactive: {
      type: 'input',
      message: 'Location? (examples: San Francisco, MIT)',
    },
  },
  url: {
    describe: 'Event details URL',
    string: true,
    interactive: {
      type: 'input',
      message: 'URL of event details?',
    },
  },
});
