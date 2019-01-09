'use strict';

const _ = require('lodash');
const build = require('./../lib/build');
const fs = require('fs');
const opts = require('./../lib/options');
const path = require('path');

// Helper for init display
const showInit = (lando, options) => {
  console.log(lando.cli.makeArt('init'));
  // Grab a new cli table
  const table = lando.cli.makeTable();
  // Add data
  table.add('NAME', options.name);
  table.add('LOCATION', options.destination);
  table.add('RECIPE', options.recipe);
  table.add('DOCS', `https://docs.devwithlando.io/tutorials/${options.recipe}.html`);
  // Print the table
  console.log(table.toString());
  // Space it
  console.log('');
};

// Helper for basic YAML
const getYaml = (dest, options, lando) => {
  // Get existing lando if we have it
  // @NOTE: need to remember to add support for lando.dist files whenever we have a
  // a lando yaml config merge option available function available
  const existingLando = (fs.existsSync(dest)) ? lando.yaml.load(dest) : {};
  // Set the basics
  const landoConfig = {name: options.name, recipe: options.recipe};
  // Set the webroot if we have one
  if (!_.isEmpty(options.webroot)) _.set(landoConfig, 'config.webroot', options.webroot);
  // Return merged YAML
  return _.merge(existingLando, landoConfig);
};

// Helper to run our build tasks
const runBuild = (lando, options = {}, steps = []) => lando.Promise.each(steps, step => {
  if (_.has(step, 'func')) {
    return step.func(options, lando);
  } else {
    return build.run(lando, build.buildRun(_.merge({}, build.runDefaults(lando, options), step)));
  };
});

module.exports = lando => {
  // Stuffz we need
  const inits = lando.config.inits;
  const sources = lando.config.sources;
  const recipes = lando.config.recipes;
  const configOpts = opts.getConfigOptions(inits.concat(sources), lando);

  return {
    command: 'init',
    level: 'app',
    describe: 'Initializes code for use with lando',
    options: _.merge(opts.baseOpts(recipes, sources), configOpts, opts.overrideOpts(inits, recipes, sources)),
    run: options => {
      // Parse options
      options = opts.parseOptions(options);
      // Get our recipe and source configs
      // const recipeConfig = opts.getConfig(inits, options.recipe);
      const sourceConfig = opts.getConfig(sources, options.source);
      const buildSteps = (!_.isEmpty(sourceConfig.build(options, lando))) ? sourceConfig.build(options, lando) : [];
      // Pre init event and run build steps
      return lando.events.emit('pre-init', options, buildSteps).then(() => runBuild(lando, options, buildSteps))

      // Compile the yaml
      .then(() => {
        // Where are we going?
        const dest = path.join(options.destination, '.lando.yml');
        const landoFile = getYaml(dest, options, lando);
        // Get a lower level config if needed, merge in current recipe config
        if (options.full) {
          const Recipe = lando.factory.get(options.recipe);
          const recipeConfig = _.merge({}, landoFile, {app: landoFile.name, _app: {_config: lando.config}});
          _.merge(landoFile, new Recipe(landoFile.name, recipeConfig).config);
          delete landoFile.recipe;
          delete landoFile.config;
        }
        // Merge and dump the config file
        lando.yaml.dump(dest, landoFile);
        // Show it
        showInit(lando, options);
      })

      // Post init event
      .then(() => lando.events.emit('post-init', options));
    },
  };
};
