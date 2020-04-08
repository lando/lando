'use strict';

const _ = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const utils = require('./../../../lib/utils');

// Helper to get core options
const coreOpts = sources => ({
  source: {
    describe: 'The location of your apps code',
    choices: _.map(sources, 'name'),
    alias: ['src'],
    string: true,
    interactive: {
      type: 'list',
      message: 'From where should we get your app\'s codebase?',
      default: 'cwd',
      choices: _.map(sources, source => ({name: source.label, value: source.name})),
      weight: 100,
    },
  },
});

// Helper to get default options
const defaultOpts = {
  destination: {
    hidden: true,
    alias: ['dest', 'd'],
    string: true,
  },
  full: {
    describe: 'Dump a lower level lando file',
    default: false,
    boolean: true,
  },
  option: {
    alias: ['o'],
    describe: 'Merge additional KEY=VALUE pairs into your recipes config',
    array: true,
  },
  yes: {
    describe: 'Auto answer yes to prompts',
    alias: ['y'],
    default: false,
    boolean: true,
  },
};

// Helper to get source option conflicts
/*
const getConflicts = (name, all, lando) => _(all)
  .filter(one => _.has(one, 'options'))
  .flatMap(one => _.keys(one.options(lando)))
  .thru(options => _.difference(options, _.keys(_.find(all, {name}).options(lando))))
  .value();
*/

// Name Opts
const nameOpts = {
  describe: 'The name of the app',
  string: true,
  interactive: {
    type: 'input',
    message: () => 'What do you want to call this app?',
    default: () => 'My Lando App',
    filter: input => utils.appMachineName(input),
    when: () => true,
    weight: 1000,
    validate: () => true,
  },
};

// Recipe Opts
const recipeOpts = recipes => ({
  describe: 'The recipe with which to initialize the app',
  choices: recipes,
  alias: ['r'],
  string: true,
  interactive: {
    type: 'list',
    message: () => 'What recipe do you want to use?',
    default: () => 'lamp',
    choices: _.map(recipes, recipe => ({name: recipe, value: recipe})),
    filter: input => input,
    when: () => true,
    weight: 500,
    validate: () => true,
  },
});

// Webroot Opts
const webrootOpts = {
  describe: 'Specify the webroot relative to app root',
  string: true,
  interactive: {
    type: 'input',
    message: () => 'Where is your webroot relative to the init destination?',
    default: () => '.',
    filter: input => input,
    when: answers => true,
    weight: 900,
    validate: () => true,
  },
};

// Helper to get a base for our dynamic opts, eg things that will change based on source/recipe selection
const auxOpts = recipes => ({name: nameOpts, recipe: recipeOpts(_.orderBy(recipes)), webroot: webrootOpts});

// Helper to get a good base of options
exports.baseOpts = (recipes = [], sources = []) => _.merge(defaultOpts, coreOpts(sources), auxOpts(recipes));

// Helper to select the correct plugin config
exports.getConfig = (data = [], name) => _.find(data, {name});

// Helper to get config options
exports.getConfigOptions = (all, lando, options = {}) => {
  _.forEach(all, one => {
    if (_.has(one, 'options')) {
      _.forEach(one.options(lando), (option, key) => {
        // @TODO: get auto conflict assignment to work properly
        // @NOTE: maybe it doesn't and we should just do this manually?
        // _.set(options, `${key}.conflicts`, getConflicts(one.name, all, lando));
      });
      options = _.merge({}, one.options(lando), options);
    }
  });
  return options;
};

// Helper to parse options initially
exports.parseOptions = options => {
  // We set this here instad of as a default option because of our task caching
  if (!_.has(options, 'destination')) options.destination = process.cwd();
  // Generate a machine name for the app.
  options.name = utils.appMachineName(options.name);
  // Get absolute path of destination
  options.destination = path.resolve(options.destination);
  // Create directory if needed
  if (!fs.existsSync(options.destination)) mkdirp.sync(options.destination);
  // Set node working directory to the destination
  // @NOTE: is this still needed?
  process.chdir(options.destination);
  return options;
};

// Determine whether we should override any options (just aux options for now?)
exports.overrideOpts = (inits = [], recipes = [], sources = []) => {
  const opts = auxOpts(recipes);
  _.forEach(opts, (opt, key) => {
    const isRec = key === 'recipe';
    // NOTE: when seems like the most relevant override here, should we consider adding more?
    // are we restricted by access to the answers hash or when these things actually run?
    _.forEach(['when'], prop => {
      const overrideFunc = answers => {
        const config = isRec ? exports.getConfig(sources, answers.source) : exports.getConfig(inits, answers.recipe);
        if (_.has(config, `overrides.${key}.${prop}`) && _.isFunction(config.overrides[key][prop])) {
          return config.overrides[key][prop](answers);
        } else {
          return opt.interactive[prop](answers);
        }
      };
      opts[key] = _.merge({}, {interactive: _.set({}, prop, overrideFunc)});
    });
  });
  return opts;
};
