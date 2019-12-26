'use strict';

const crypto = require('crypto');
const fs = require('fs');
const yaml = require('js-yaml');

/*
 * Helper to load a YAML file into a JS Object
 *
 * @TODO: we should mem cache these results and only read the file
 * if its contents have changed
 */
exports.loadFile = file => {
  try {
    return yaml.safeLoad(fs.readFileSync(file));
  } catch (e) {
    throw Error(`Could not load file ${file}`);
  }
};

/*
 * Helper to make an error with an HTTP code
 */
exports.makeError = (message, code = 500) => {
  const error = new Error(message);
  error.status = code;
  return error;
};

/*
 * Helper to md5Hash a string
 */
exports.md5 = data => crypto.createHash('md5').update(data).digest('hex');
