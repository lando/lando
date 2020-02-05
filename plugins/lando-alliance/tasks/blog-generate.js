'use strict';

// Modules
const _ = require('lodash');
const dayjs = require('dayjs');
const fs = require('fs');
const os = require('os');
const path = require('path');
const LandoApiClient = require('./../lib/api');

module.exports = lando => {
  // Get the API
  const api = new LandoApiClient(lando.log);
  // Get some path data
  const blogPath = path.resolve(__dirname, '..', '..', '..', 'blog');
  const templateFile = path.resolve(__dirname, '..', 'templates', 'post.template');
  const postsPath = path.join(blogPath, 'posts');

  // Get the authors
  const authors = _.map(api.read('contributors'), author => ({name: author.name, value: author.id}));
  authors.unshift({name: 'Team Lando', value: 'Team Lando'});
  // Get the tags
  const tags = [
    {name: 'Case Study', value: 'case-study'},
    {name: 'DevOps', value: 'devops'},
    {name: 'Development', value: 'development'},
    {name: 'Lando', value: 'lando'},
    {name: 'Workflows', value: 'workflows'},
  ];

  return {
    command: 'blog:generate',
    describe: 'Scaffold out a Lando blog post',
    options: {
      title: {
        describe: 'A title',
        string: true,
        interactive: {
          type: 'input',
          default: 'An example post',
          message: 'Post title?',
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
          message: 'Post description?',
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
      tags: {
        describe: 'Tags',
        array: true,
        choices: tags,
        interactive: {
          type: 'checkbox',
          message: 'Tags?',
          choices: tags,
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
    },
    run: options => {
      // Today things
      const year = dayjs().format('YYYY');
      const month = dayjs().format('MM');
      const day = dayjs().format('DD');
      // Build The basic data
      const data = _.merge({}, {
        filePath: path.join(postsPath, `${year}-${month}-${day}-${_.kebabCase(options.title)}.md`),
        date: dayjs().format('YYYY-MM-DD'),
        url: `https://blog.lndo.site/${year}/${month}/${day}/${_.kebabCase(options.title)}/`,
        author: 'Team Lando',
        pic: 'https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd',
        link: 'https://twitter.com/devwithlando',
        location: 'The Internet',
        parsedTags: _.map(options.tags, tag => `- ${tag}`).join(os.EOL),
      }, options);

      // if file already exists then throw error
      // if (fs.existsSync(data.filePath)) throw Error(`Post already exists at ${data.filePath}!`);

      // Add author data if we have it
      if (data.author !== 'Team Lando') {
        const author = _.first(api.read('contributors', {id: data.author}));
        data.author = author.name;
        data.pic = author.pic;
        data.link = author.twitter ? `https://twitter.com/${author.twitter}` : `https://github.com/${author.github}`;
        data.location = author.location;
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
