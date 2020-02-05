'use strict';

// Modules
const _ = require('lodash');

// Things the contributor helps with
const roles = [
  'Administration',
  'Code',
  'Content',
  'DevOps',
  'Documentation',
  'Evangelism',
  'Events',
  'Guides and Tutorials',
  'Issues',
  'Meetups',
  'Outreach',
  'Support',
  'Training',
];

// Options for adding a contrib
exports.addOptions = {
  email: {
    describe: 'A Gravatar email (this is only used to get a pic, it is not saved)',
    string: true,
    interactive: {
      type: 'input',
      default: 'lando@lando.dev',
      message: 'Gravatar email?',
    },
  },
  name: {
    describe: 'A name or identifier',
    string: true,
    interactive: {
      type: 'input',
      message: 'Name or identifier? (Examples: Beats McGee, @theplague)',
      validate: input => {
        if (_.isEmpty(input)) return 'This cannot be empty!';
        return true;
      },
    },
  },
  role: {
    describe: 'Things the contributor helps with?',
    array: true,
    alias: ['r'],
    choices: roles,
    interactive: {
      type: 'checkbox',
      message: 'Helps with?',
      choices: roles,
    },
  },
  bio: {
    describe: 'Brief bio',
    string: true,
    interactive: {
      type: 'input',
      message: 'Brief bio? (150 characters or less)',
      validate: input => {
        if (_.size(input) > 150) return 'Must be 150 characters or less!';
        return true;
      },
    },
  },
  location: {
    describe: 'A location',
    string: true,
    interactive: {
      type: 'input',
      message: 'Location? (example: San Francisco, CA)',
    },
  },
  github: {
    describe: 'A GitHub username',
    string: true,
    interactive: {
      type: 'input',
      message: 'GitHub username? (example: substack)',
    },
  },
  twitter: {
    describe: 'A Twitter username',
    string: true,
    interactive: {
      type: 'input',
      message: 'Twitter username? (example: devwithlando)',
      validate: input => {
        if (_.startsWith(input, '@')) return 'Omit the @!';
        return true;
      },
    },
  },
};
