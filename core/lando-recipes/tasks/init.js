'use strict';

const _ = require('lodash');
const build = require('./../lib/build');
const fs = require('fs');
const opts = require('./../lib/options');
const path = require('path');

// Helper for init display
const showInit = (lando, options) => {
  console.log(lando.cli.makeArt('init'));
  // Print the table
  console.log(lando.cli.formatData({
    name: options.name,
    location: options.destination,
    recipe: options.recipe,
    docs: `https://docs.lando.dev/config/${options.recipe}.html`,
  }, {format: 'table'}, {border: false}));
  // Space it
  console.log('');
};

// Helper for basic YAML
const getYaml = (dest, options, lando) => {
  // Get existing lando if we have it
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
    step.cmd = (_.isFunction(step.cmd)) ? step.cmd(options) : step.cmd;
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
      // Parse options abd and configs
      options = opts.parseOptions(options);
      // Get our recipe and source configs
      const recipeConfig = opts.getConfig(inits, options.recipe);
      const sourceConfig = opts.getConfig(sources, options.source);
      // Get our build and config steps
      const buildSteps = (_.has(sourceConfig, 'build')) ? sourceConfig.build(options, lando) : [];
      const configStep = (_.has(recipeConfig, 'build')) ? recipeConfig.build : () => {};

      // Pre init event and run build steps
      // @NOTE: source build steps are designed to grab code from somewhere
      return lando.events.emit('pre-init', options, buildSteps).then(() => runBuild(lando, options, buildSteps))
      // Run any config steps
      // @NOTE: config steps are designed to augmnet the landofile with additional metadata
      .then(() => configStep(options, lando))

      // Compile and dump the yaml
      .then((config = {}) => {
        // Where are we going?
        const dest = path.join(options.destination, '.lando.yml');
        const landoFile = getYaml(dest, options, lando);

        // Get a lower level config if needed, merge in current recipe config
        if (options.full) {
          const Recipe = lando.factory.get(options.recipe);
          const recipeConfig = _.merge({}, landoFile, {app: landoFile.name, _app: {_config: lando.config}});
          _.merge(landoFile, new Recipe(landoFile.name, recipeConfig).config);
        }

        // Merge in any additional configuration options specified
        _.forEach(options.option, option => {
          const key = _.first(option.split('='));
          _.set(landoFile, `config.${key}`, _.last(option.split('=')));
        });

        // Merge and dump the config file
        lando.yaml.dump(dest, _.merge(landoFile, config));
        // Show it
        showInit(lando, options);
      })

      // Post init event
      .then(() => lando.events.emit('post-init', options));
    },
  };
};
