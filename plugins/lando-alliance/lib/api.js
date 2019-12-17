'use strict';

// Modules
const _ = require('lodash');
const hasher = require('object-hash');
const Log = require('./../../../lib/logger');
const path = require('path');
const Yaml = require('./../../../lib/yaml');

// Default data directory
const apiDataDir = path.resolve(__dirname, '..', '..', '..', 'api', 'data');

/*
 * Creates a new api client instance.
 */
module.exports = class LandoApiClient {
  constructor(log = new Log(), base = apiDataDir) {
    this.base = base;
    this.log = log;
    this.yaml = new Yaml(this.log);
  };

  /*
   * Create a data source
   */
  create(source, data = {}) {
    const database = this.read(source);
    database.push(_.merge({}, data, {id: hasher(data)}));
    return this.yaml.dump(path.resolve(this.base, `${source}.yml`), _.uniqBy(database, 'id'));
  };

  /*
   * Wipe the ENTIRE data source
   */
  delete(source, id) {
    if (!id) throw Error('Specify a resource ID to remove!');
    const database = _(this.read(source)).filter(item => item.id === id).value();
    return this.yaml.dump(path.resolve(this.base, `${source}.yml`), database);
  };

  /*
   * Return a data source
   */
  read(source, filters = {}) {
    const result = this.yaml.load(path.resolve(this.base, `${source}.yml`)) || [];
    if (!_.isEmpty(filters)) return _.filter(result, filters);
    return result;
  };

  /*
   * Alias of create
   */
  update(source, data = {}) {
    return this.create(source, data);
  };
};
