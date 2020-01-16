'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const LandoApiClient = require('./../lib/api');

module.exports = lando => {
  // Get the API
  const api = new LandoApiClient(lando.log);
  // Get some path data
  const docsPath = path.resolve(__dirname, '..', '..', '..', 'docs');
  const templateFile = path.resolve(__dirname, '..', 'templates', 'guide.template');
  const guidesFile = path.join(docsPath, '.vuepress', 'guides.json');
  const guidesData = require(guidesFile);
  const guidesPath = path.join(docsPath, 'guides');

  // Get the authors
  const authors = _.map(api.read('contributors'), 'name');
  authors.unshift('Team Lando');
  // Get the categories
  const categories = _.map(guidesData, 'title');

  return {
    command: 'guide:generate',
    describe: 'Scaffold out a Lando guide',
    options: {
      title: {
        describe: 'A title',
        string: true,
        interactive: {
          type: 'input',
          default: 'A precise title such as Running Drupal 4.6 on Lando',
          message: 'Guide title?',
          validate: input => {
            if (_.size(input) > 100) return 'Must be 100 characters or less!';
            return true;
          },
        },
      },
      description: {
        describe: 'A description',
        string: true,
        interactive: {
          type: 'input',
          default: 'A longer and SEO dense description',
          message: 'Guide title?',
          validate: input => {
            if (_.size(input) > 160) return 'Must be 160 characters or less!';
            return true;
          },
        },
      },
      author: {
        describe: 'An author',
        string: true,
        choices: authors,
        interactive: {
          type: 'list',
          message: 'Written by?',
          default: 'Team Lando',
          choices: authors,
        },
      },
      category: {
        describe: 'Best category for guide',
        string: true,
        choices: categories,
        interactive: {
          type: 'list',
          message: 'Best category?',
          default: 'General',
          choices: categories,
        },
      },
      original: {
        describe: 'URL of original content',
        string: true,
        interactive: {
          type: 'input',
          message: 'URL of original content?',
        },
      },
      repo: {
        describe: 'URL of example repo',
        string: true,
        interactive: {
          type: 'input',
          message: 'URL of example repo?',
        },
      },
    },
    run: options => {
      console.log(options);
      // Build template and dump data
      const data = options;
      const filePath = path.join(guidesPath, `${_.kebabCase(options.title)}.md`);

      // if file already exists then throw error
      if (fs.existsSync(filePath)) throw Error(`Guide already exists at ${filePath}!`);

      // Add new guide to selected category and update categories file
      const section = _.find(guidesData, {title: options.category});
      section.children.push(_.kebabCase(options.title));
      section.children = _.uniq(_.sortBy(section.children));
      fs.writeFileSync(guidesFile, JSON.stringify(_.orderBy(guidesData, ['title']), null, 2));

      // Dump the new guide
      const compiled = _.template(fs.readFileSync(templateFile, 'utf8'));
      fs.writeFileSync(filePath, compiled({title: 'mustache'}));

      // Log
      console.log('"%s" was created at %s', data.title, filePath);
    },
  };
};

/*
---
date: 12-23-2019
original: https://link.to.where.blog.shows.up
repo: https://link.to.example.code
author:
  name: Mike Pirog
  title: Benevolent Dicatator
  twitter: pirogcommamike
  github: pirog
---
*/
