'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const Log = require('./../../../lib/logger');
const path = require('path');
const tar = require('tar');
const yaml = require('js-yaml');

/*
 * Creates a new yaml instance.
 */
module.exports = class PlatformYaml {
  constructor(baseDir = process.cwd(), log = new Log()) {
    this.base = baseDir;
    this.log = log;

    // Archive tag
    this.ArchiveYamlType = new yaml.Type('!archive', {
      kind: 'scalar',
      resolve: data => {
        // Kill immediately if we have to
        if (!_.isString(data)) return false;
        // Otherwise make sure this is dir that exists
        return fs.existsSync(path.join(this.base, '.platform', data));
      },
      construct: data => {
        const configPath = path.join(this.base, '.platform', data);
        const createOpts = {gzip: true, cwd: configPath, sync: true};
        const archive = tar.create(createOpts, fs.readdirSync(configPath));
        // We need to read it as base64
        archive.setEncoding('base64');
        // Return the archive data
        return archive.read();
      },
    });

    // Include tag
    this.IncludeYamlType = new yaml.Type('!include', {
      kind: 'mapping',
      resolve: data => {
        // Kill immediately if we have to
        if (!_.isString(data.path)) return false;
        // Otherwise make sure this is dir that exists
        return fs.existsSync(path.join(this.base, '.platform', data.path));
      },
      construct: data => {
        const filePath = path.join(this.base, '.platform', data.path);
        return fs.readFileSync(filePath, {encoding: 'utf8'});
      },
    });

    // The new schema
    this.PLATFORM_SCHEMA = yaml.Schema.create([this.ArchiveYamlType, this.IncludeYamlType]);
  };

  load(data) {
    return yaml.load(data, {schema: this.PLATFORM_SCHEMA});
  };
};
