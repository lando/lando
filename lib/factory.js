'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const utils = require('./utils');

/*
 * The lowest level class from which all other services and recipes are built on
 * @TODO: presumably this will get larger over time as we add more options
 */
const dockerCompose = class ComposeService {
  constructor(id, info = {}, ...sources) {
    this.id = id;
    this.info = info;
    this.data = _(sources).map(source => _.merge({}, source, {version: '3.6'})).value();
  };
};

/*
 * The lowest level class from which all other services and recipes are built on
 * @TODO: presumably this will get larger over time as we add more options
 */
const landoRecipe = class LandoRecipe {
  constructor(id, config = {}) {
    // Move our config into the userconfroot if we have some
    // NOTE: we need to do this because on macOS and Windows not all host files
    // are shared into the docker vm

    if (fs.existsSync(config.confSrc)) utils.moveConfig(config.confSrc, config.confDest);
    this.id = id;
    this.config = {
      proxy: config.proxy,
      services: config.services,
      tooling: config.tooling,
    };
  };
};

/*
 * @TODO
 */
module.exports = class Factory {
  // @TODO add recipe base class as well?
  constructor(classes = [
    {name: '_compose', builder: dockerCompose},
    {name: '_recipe', builder: landoRecipe},
  ]) {
    this.registry = classes;
  };

  /*
   * Add things
   * @TODO: Document the common form here
   */
  add({name, builder, config = {}, parent = null}) {
    this.registry.push({name, builder: builder(this.get(parent), config)});
    return this.get(name);
  };

  /*
   * Retrieve one or all the builders
   * @TODO: provide warning when we can't find a builder and list valid registry things
   */
  get(name = '') {
    return (!_.isEmpty(name)) ? _.find(this.registry, {name}).builder : this.registry;
  };
};
