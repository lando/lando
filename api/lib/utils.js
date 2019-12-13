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
