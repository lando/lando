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
  const authors = _.map(api.read('contributors'), author => ({name: author.name, value: author.id}));
  authors.unshift({name: 'Team Lando', value: 'none'});
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
          default: 'An example guide',
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
          message: 'Guide description?',
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
      // Build The basic data
      const data = _.merge({}, options, {
        date: new Date().toISOString(),
        filePath: path.join(guidesPath, `${_.kebabCase(options.title)}.md`),
        url: `https://docs.lndo.site/guides/${_.kebabCase(options.title)}.html`,
      });

      // if file already exists then throw error
      // if (fs.existsSync(data.filePath)) throw Error(`Guide already exists at ${data.filePath}!`);

      // Add new guide to selected category and update categories file
      const section = _.find(guidesData, {title: data.category});
      section.children.push(_.kebabCase(data.title));
      section.children = _.uniq(_.sortBy(section.children));
      fs.writeFileSync(guidesFile, JSON.stringify(_.orderBy(guidesData, ['title']), null, 2));

      // Add author data if we have it
      if (data.author !== 'none') {
        const author = _.first(api.read('contributors', {id: data.author}));
        data.author = author.name;
        data.pic = author.pic;
        data.link = author.twitter ? `https://twitter.com/${author.twitter}` : `https://github.com/${author.github}`;
      }
      // Default to Team Lando
      else if(data.author === 'none') {
        data.author = 'Team Lando';
        data.pic = 'https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd';
        data.link = 'https://twitter.com/devwithlando';
      }
      // Dump the new guide
      const compiled = _.template(fs.readFileSync(templateFile, 'utf8'));
      fs.writeFileSync(data.filePath, compiled(data));

      // Log
      const displayData = _.omit(data, ['_', '_app', 'v', 'verbose', '$0']);
      console.log(lando.cli.makeArt('newContent'));
      console.log(lando.cli.formatData(displayData, {format: 'table'}, {border: false}));
      console.log(' ');
    },
  };
};
