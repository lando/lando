#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const argv = require('yargs').argv;
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const Log = require('./../lib/logger');
const log = new Log({logLevelConsole: 'debug', logName: 'yaml2json'});
const path = require('path');
const yaml = require('js-yaml');

// Get file args
const inputFiles = argv._;
// Get options
const outputDir = path.resolve(argv.outputDir || process.cwd());

// If no files then print some basic usage shit
if (_.isEmpty(inputFiles)) {
  log.error('You must pass in at least one filename argument!');
  process.exit(2);
}

// Validate filenames
const inputFilePaths = _(inputFiles)
  // Map to absolute paths relative to cwd
  .map(file => path.resolve(process.cwd(), file))
  // Filter out nonexistent files and warn
  .filter(file => {
    if (!fs.existsSync(file)) log.warn('Could not locate file %s! Skipping that one...', file);
    return fs.existsSync(file);
  })
  // warn
  .value();

// Make sure output dir is dialed
if (!fs.existsSync(outputDir)) {
  log.info('%s does not exists, creating it...', outputDir);
  mkdirp.sync(outputDir);
}

// Finalize inputs and outputs
const files = _(inputFilePaths)
  // Map to input/output pairs
  .map(file => ({
    input: file,
    output: path.resolve(outputDir, `${path.basename(file, path.extname(file))}.json`),
  }))
  .value();


// Write the files
_.forEach(files, file => {
  log.info('Generating %s from %s...', file.output, file.input);
  const data = yaml.load(fs.readFileSync(file.input, {encoding: 'utf-8'}));
  fs.writeFileSync(file.output, JSON.stringify(data));
  log.info('Wrote %s.', file.output);
});
