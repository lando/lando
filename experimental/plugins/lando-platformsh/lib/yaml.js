'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const Log = require('./../../../../lib/logger');
const path = require('path');
const yaml = require('js-yaml');

/*
 * Creates a new yaml instance.
 */
module.exports = class PlatformYaml {
  constructor(baseDir = process.cwd(), log = new Log()) {
    this.base = baseDir;
    this.log = log;

    // New types
    this.ArchiveYamlType = new yaml.Type('!archive', {
      kind: 'scalar',
      resolve: data => {
        // Kill immediately if we have to
        if (!_.isString(data)) return false;
        // Otherwise make sure this is dir
        return fs.existsSync(path.join(this.base, '.platform', data));
      },
      construct: data => {
        const fullPath = path.join(this.base, '.platform', data);
        const files = _.map(fs.readdirSync(fullPath), file => path.join(fullPath, file));
        // if we have files do something?
        console.log(files);
        return fullPath;
      },
    });

    // The new schema
    this.PLATFORM_SCHEMA = yaml.Schema.create([this.ArchiveYamlType]);
  };

  load(data) {
    return yaml.load(data, {schema: this.PLATFORM_SCHEMA});
  };
};
