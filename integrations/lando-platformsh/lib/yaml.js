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
    // @NOTE: We need this for weird reasons eg our custom yaml types are relative
    // paths to files and its not obvious how we easily resolve them to absolute
    // path
    this.base = baseDir;
    this.log = log;

    // Archive tag
    this.ArchiveYamlType = new yaml.Type('!archive', {
      kind: 'scalar',
      resolve: data => {
        // Kill immediately if we have to
        if (!_.isString(data)) return false;
        // Otherwise make sure this is dir that exists
        return fs.existsSync(path.resolve(this.base, data));
      },
      construct: data => {
        const configPath = path.resolve(this.base, data);
        const createOpts = {gzip: true, cwd: configPath, sync: true};
        const archive = tar.create(createOpts, fs.readdirSync(configPath));
        // We need to read it as base64
        archive.setEncoding('base64');
        // Return the archive data
        return archive.read();
      },
    });

    // Include tag mapping version
    this.IncludeMappingYamlType = new yaml.Type('!include', {
      kind: 'mapping',
      resolve: data => {
        // Kill immediately if we have to
        if (!_.isString(data.path)) return false;
        // Otherwise check the path exists
        return fs.existsSync(path.resolve(this.base, data.path));
      },
      construct: data => {
        // Get the path resolved
        const filePath = path.resolve(this.base, data.path);
        // Switch based on type
        switch (data.type) {
          case 'binary': return fs.readFileSync(filePath, {encoding: 'base64'});
          case 'string': return fs.readFileSync(filePath, {encoding: 'utf8'});
          case 'yaml': return this.load(filePath);
          default: return this.load(filePath);
        };
      },
    });
    this.IncludeStringYamlType = new yaml.Type('!include', {
      kind: 'scalar',
      resolve: data => {
        // Kill immediately if we have to
        if (!_.isString(data)) return false;
        // Otherwise check the path exists
        return fs.existsSync(path.resolve(this.base, data));
      },
      construct: data => {
        return this.load(path.resolve(this.base, data));
      },
    });

    // The new schema
    this.PLATFORM_SCHEMA = yaml.Schema.create([
      this.ArchiveYamlType,
      this.IncludeMappingYamlType,
      this.IncludeStringYamlType,
    ]);
  };

  load(file) {
    // Get the basedir from the file
    this.base = path.dirname(file);
    // Load the stuff
    return yaml.load(fs.readFileSync(file), {schema: this.PLATFORM_SCHEMA});
  };
};
