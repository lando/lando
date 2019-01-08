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
    conflicts: 'recipe',
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
    default: process.cwd(),
  },
  full: {
    describe: 'Dump a lower level lando file',
    default: false,
    boolean: true,
  },
  yes: {
    describe: 'Auto answer yes to prompts',
    alias: ['y'],
    default: false,
    boolean: true,
  },
};

// Helper to select the correct plugin config
const getConfig = (inits = [], sources = [], answers = {}, isRecipe = false) => {
  return (isRecipe) ? _.find(sources, {name: answers.source}) : _.find(inits, {name: answers.recipe});
};

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
  describe: 'Specify the webroot relative to destination',
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

// Determine whether we should override any options (just aux options for now?)
const overrideOpts = (inits = [], recipes = [], sources = []) => {
  const opts = auxOpts(recipes);
  _.forEach(opts, (opt, key) => {
    // NOTE: when seems like the most relevant override here, should we consider adding more?
    // are we restricted by access to the answers hash or when these things actually run?
    _.forEach(['when'], prop => {
      const overrideFunc = answers => {
        const config = getConfig(inits, sources, answers, key === 'recipe');
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

// Helper to get a base for our dynamic opts, eg things that will change based on source/recipe selection
const auxOpts = recipes => ({name: nameOpts, recipe: recipeOpts(recipes), webroot: webrootOpts});

module.exports = lando => {
  // Stuffz we need
  const inits = lando.config.inits;
  const sources = lando.config.sources;
  const recipes = lando.config.recipes;

  return {
    command: 'init',
    level: 'app',
    describe: 'Initializes code for use with lando',
    options: _.merge(defaultOpts, coreOpts(sources), auxOpts(recipes), overrideOpts(inits, recipes, sources)),
    run: options => {
      // Generate a machine name for the app.
      options.name = lando.utils.appMachineName(options.name);
      // Get absolute path of destination
      options.destination = path.resolve(options.destination);
      // Create directory if needed
      if (!fs.existsSync(options.destination)) mkdirp.sync(options.destination);
      // Set node working directory to the destination
      // @NOTE: is this still needed?
      process.chdir(options.destination);
      console.log(options);

      // EXECUTE THE CODE GRABBING STEP
      //
      //

      // Set the basics
      const landoConfig = {name: options.name, recipe: options.recipe};
      if (!_.isEmpty(options.webroot)) _.set(landoConfig, 'config.webroot', options.webroot);

      // Get a lower level config if needed, merge in current recipe config
      if (options.full) {
        const Recipe = lando.factory.get(options.recipe);
        const recipeConfig = _.merge({}, landoConfig, {app: landoConfig.name, _app: {_config: lando.config}});
        _.merge(landoConfig, new Recipe(landoConfig.name, recipeConfig).config);
        delete landoConfig.recipe;
        delete landoConfig.config;
      }

      // Where are we going?
      const dest = path.join(options.destination, '.lando.yml');

      // Rebase on top of any existing yaml
      // @NOTE: need to remember to add support for lando.dist files whenever we have a
      // a lando yaml config merge option available function available
      if (fs.existsSync(dest)) _.merge(landoConfig, lando.yaml.load(dest));

      // Dump the config file
      lando.yaml.dump(dest, landoConfig);

        // Header it
      console.log(lando.cli.makeArt('init'));
      // Grab a new cli table
      const table = lando.cli.makeTable();
      // Add data
      table.add('NAME', landoConfig.name);
      table.add('LOCATION', options.destination);
      table.add('RECIPE', options.recipe);
      table.add('DOCS', `https://docs.devwithlando.io/tutorials/${landoConfig.recipe}.html`);
      // Print the table
      console.log(table.toString());
      // Space it
      console.log('');
    },
  };
};
