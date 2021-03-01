'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

exports.getAcliUuid = () => {
  const file = '.acquia-cli.yml';
  if (fs.existsSync(file)) {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    return data.cloud_app_uuid;
  }
  return null;
};

exports.writeAcliUuid = uuid => {
  const file = '.acquia-cli.yml';
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `cloud_app_uuid: ${uuid}\n`);
    return true;
  }
  return false;
};

exports.writeEnvUuids = data => {
  const file = './acquia-envs.json';
  fs.writeFileSync(file, JSON.stringify(data));
  return false;
};

/**
 * @TODO: Refactor to grab env UUIDs from Acquia API once cloud_api.conf
 * gets its new storage format in updated acquia/cli tool.
 *
 * Once we grab the UUIDs via API we can remove the code in `init.js` that is
 * writing out to the file `acquia-envs.json`.
 */
exports.getEnvUuids = () => {
  const file = './acquia-envs.json';
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return null;
};

/*
 * Get acli token from host
 */
exports.getAcquiaToken = home => {
  const file = path.join(home, '.acquia', 'cloud_api.conf');
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return null;
};

/*
 * Get acli token from host
 */
exports.getComposerConfig = () => {
  const file = path.join('composer.json');
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return null;
};

/*
 * Helper to return most recent tokens
 */
exports.sortTokens = (...sources) => _(_.flatten([...sources]))
  .sortBy('date')
  .groupBy('email')
  .map(tokens => _.last(tokens))
  .value();
