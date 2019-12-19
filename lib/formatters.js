'use strict';

// Modules
const _ = require('lodash');
const util = require('util');

// Const
const formatOpts = {
  format: {
    describe: 'Output in given format: json',
    string: true,
  },
  path: {
    describe: 'Only return the value at the given path',
    default: null,
    string: true,
  },
  filter: {
    describe: 'Filter by "key=value"',
    array: true,
  },
};

/*
 * Format data
 */
exports.formatData = (input, {path = '', format = 'default', filter = {}} = {}) => {
  const data = path && _.has(input, path) ? _.get(input, path) : input;
  switch (format) {
      case 'json':
        return JSON.stringify(data);
        break;
      // @TODO: Add CSV.
      default:
        return util.inspect(data, {
          colors: process.stdout.isTTY,
          depth: 10,
          compact: false,
        });
    }
};

/*
 * FormatOptios
 */
exports.formatOptions = (omit = []) => _.omit(formatOpts, omit);

/*
 * Helper to get interactive options
 */
exports.getInteractive = (options, argv) => _(options)
  .map((option, name) => _.merge({}, {name}, {option}))
  .filter(option => !_.isEmpty(_.get(option, 'option.interactive', {})))
  .map(option => _.merge({}, {name: option.name, weight: 0}, option.option.interactive))
  .map(option => {
    if (_.isNil(argv[option.name]) || argv[option.name] === false) return option;
    else {
      return _.merge({}, option, {when: answers => {
        answers[option.name] = argv[option.name];
        return false;
      }});
    }
  })
  .value();

/*
 * Helper to prompt the user if needed
 */
exports.handleInteractive = (inquiry, argv, command, lando) => lando.Promise.try(() => {
  if (_.isEmpty(inquiry)) return {};
  else {
    const inquirer = require('inquirer');
    inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
    // Try to rebuild the inquiry if this is app level bootstrap and we have an app
    if (!_.isEmpty(argv._app) && lando._bootstrap === 'app') {
      // NOTE: We need to clone deep here otherwise any apps with interactive options get 2x all their events
      // NOTE: Not exactly clear on why app here gets conflated with the app returned from lando.getApp
      const app = _.cloneDeep(lando.getApp(argv._app.root));
      return app.init().then(() => {
        inquiry = exports.getInteractive(_.find(app.tasks.concat(lando.tasks), {command: command}).options, argv);
        return inquirer.prompt(_.sortBy(inquiry, 'weight'));
      });
    // Otherwise just run
    } else {
      inquiry = exports.getInteractive(_.find(lando.tasks, {command: command}).options, argv);
      return inquirer.prompt(_.sortBy(inquiry, 'weight'));
    }
  }
});

/*
 * Helper to sort options
 */
exports.sortOptions = options => _(options)
  .keys()
  .sortBy()
  .map(key => [key, options[key]])
  .fromPairs()
  .value();
