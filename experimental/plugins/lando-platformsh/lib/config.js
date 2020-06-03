'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/*
 * Helper to locate the "closest" platform yaml
 */
exports.findClosestApplication = (startFrom = process.cwd()) => {
  const file = path.resolve(startFrom, '.platform.app.yaml');
  return _(_.range(path.dirname(file).split(path.sep).length))
    .map(end => _.dropRight(path.dirname(file).split(path.sep), end).join(path.sep))
    .map(dir => path.join(dir, path.basename(file)))
    .sortBy()
    .reverse()
    .filter(file => fs.existsSync(file) && path.isAbsolute(file))
    .thru(files => files[0])
    .value();
};

/*
 * Helper to load all the platform config files we can find
 */
exports.loadConfigFiles = baseDir => {
  const routesFile = path.join(baseDir, '.platform', 'routes.yaml');
  const servicesFile = path.join(baseDir, '.platform', 'services.yaml');
  return {
    applications: _(fs.readdirSync(baseDir, {withFileTypes: true}))
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .concat('.')
      .map(directory => path.resolve(baseDir, directory, '.platform.app.yaml'))
      .filter(file => fs.existsSync(file))
      .map(file => yaml.safeLoad(fs.readFileSync(file)))
      .value() || [],
    applicationFiles: _(fs.readdirSync(baseDir, {withFileTypes: true}))
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .concat('.')
      .map(directory => path.resolve(baseDir, directory, '.platform.app.yaml'))
      .filter(file => fs.existsSync(file))
      .map(file => ({data: yaml.safeLoad(fs.readFileSync(file)), file}))
      .map(data => ({name: data.data.name, file: data.file, dir: path.dirname(data.file)}))
      .value() || [],
    routes: (fs.existsSync(routesFile)) ? yaml.safeLoad(fs.readFileSync(routesFile)) : {},
    services: (fs.existsSync(servicesFile)) ? yaml.safeLoad(fs.readFileSync(servicesFile)) : {},
  };
};

/*
 * Helper to parse the platformsh config files
 */
exports.parseApps = (apps = [], files = []) => _(apps)
  .map(app => _.merge({}, app, {
    application: true,
    appMountDir: _(files)
      .filter(file => file.name === app.name)
      .thru(file => file[0].dir)
      .value(),
    configFile: _(files)
      .filter(file => file.name === app.name)
      .thru(file => file[0].file)
      .value(),
    // @TODO: can we assume the 0? is this an index value?
    // @NOTE: probably not relevant until we officially support multiapp?
    hostname: `${app.name}.0`,
  }))
  .value();

/*
 * Helper to parse the platformsh config files
 */
exports.parseRelationships = apps => _(apps)
  .map(app => app.relationships || [])
  .flatten()
  .thru(relationships => relationships[0])
  .map((relationship, alias) => ({
    alias,
    service: relationship.split(':')[0],
    endpoint: relationship.split(':')[1],
  }))
  .groupBy('service')
  .value();

/*
 * Helper to parse the platformsh routes file eg replace DEFAULT in the routes.yml
 */
exports.parseRoutes = (routes, domain) => JSON.parse(JSON.stringify(routes).replace(/{default}/g, domain));

/*
 * Helper to parse the platformsh services file
 */
exports.parseServices = (services, relationships = {}) => _(services)
  .map((config, name) => _.merge({}, config, {
    aliases: _.has(relationships, name) ? _.map(relationships[name], 'alias') : [],
    application: false,
    hostname: name,
    name,
    opener: '{"relationships": {}}',
  }))
  .value();
