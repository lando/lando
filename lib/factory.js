'use strict';

// Modules
const _ = require('lodash');

/*
 * The lowest level class from which all other services and recipes are built on
 * @TODO: presumably this will get larger over time as we add more options
 * @TODO: how do we handle services that need multiple file eg proxy/service overrides?
 */
const dockerCompose = class ComposeService {
  constructor(
    id,
    {services = {}, volumes = {}, networks = {}, version = '3.2'} = {},
    {env = {}, labels = {}} = {}
  ) {
    // Mix in global env and labels
    _.forEach(services, (service, key) => {
      services[key] = _.merge({}, {environment: env, labels}, service);
    });
    // Return the result
    this.id = id;
    this.data = {version, services, volumes, networks};
  };
};

// @TODO: add recipe base in here

/*
 * @TODO
 */
module.exports = class Factory {
  // @TODO add recipe base class as well?
  constructor(classes = [{name: 'compose', builder: dockerCompose}]) {
    this.registry = classes;
  };

  /*
   * Add things
   * @TODO: Document the common form here
   */
  add({name, builder, parent = null}) {
    this.registry.push({name, builder: builder(this.get(parent))});
    return this.get(name);
  };

  /*
   * Retrieve one or all the builders
   * @TODO: provide warning when we cant find a builder and list valid registry things
   */
  get(name = '') {
    return (!_.isEmpty(name)) ? _.find(this.registry, {name}).builder : this.registry;
  };
};
