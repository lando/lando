'use strict';

const _ = require('lodash');
const dot = require('dot');
const fs = require('fs-extra');
const lex = require('marked').lexer;
const semver = require('semver');
const os = require('os');
const path = require('path');
const path2Bin = path.join('..', '..', 'bin', 'lando.js');
const startHeaders = ['Start', 'Boot', 'Spin', 'Launch', 'This is the dawning'];
const testHeaders = ['Test', 'Validat', 'Verif', 'Sanity'];
const killHeaders = ['Clean', 'Kill', 'Tear', 'Destroy', 'Nuke', 'Blow'];

/*
 * Helper to determine whether we can whitelist a header
 */
const validateTestHeader = (text, starters) => !_.isEmpty(_.filter(starters, begins => _.startsWith(text, begins)));

/*
 * Helper to remove unneeded sections from raw README data
 */
const trimReadmeTypes = datum => (datum.type === 'heading' || datum.type === 'code');

/*
 * Helper parse a test describe
 */
const parseTestDescribe = describe => _.lowerCase(_.trim(_.trimStart(describe, '#')));

/*
 * Helper parse a test command
 */
const parseTestCommand = command => _.replace(command, 'lando ', `node ${path2Bin} `);

/*
 * Helper to parse a code block
 */
const parseCodeBlock = data => _.map(data.text.split(`${os.EOL}${os.EOL}`), test => ({
  describe: _.map(_.filter(test.split(os.EOL), line => _.startsWith(line, '#')), parseTestDescribe),
  commands: _.join(_.map(_.filter(test.split(os.EOL), line => !_.startsWith(line, '#')), parseTestCommand), ' && '),
}));

/*
 * Helper to find the code block for each section
 */
const getCodeBlock = (content, starters) => {
  const index = _.findIndex(content, line => validateTestHeader(line.text, starters) && line.type === 'heading');
  return (index > -1) ? parseCodeBlock(_.find(content, {type: 'code'}, index)) : null;
};

/*
 * Helper to translate trimmed raw README data into good testing metadata
 */
const mapsOfMeaning = (file, content) => ({
  id: _.takeRight(_.dropRight(file.split(path.sep)))[0],
  file: file,
  run: path.join('examples', _.takeRight(_.dropRight(file.split(path.sep)))[0]),
  title: _.kebabCase(_.find(content, {type: 'heading', depth: 1}).text),
  start: getCodeBlock(content, startHeaders),
  tests: getCodeBlock(content, testHeaders),
  clean: getCodeBlock(content, killHeaders),
});

/*
 * Helper to remove unneeded headers from raw README data
 */
const trimHeaders = datum => {
  if (datum.type === 'heading' && datum.depth === 1) return true;
  else if (datum.type === 'heading' && datum.depth < 3 && validateTestHeader(datum.text, startHeaders)) return true;
  else if (datum.type === 'heading' && datum.depth < 3 && validateTestHeader(datum.text, testHeaders)) return true;
  else if (datum.type === 'heading' && datum.depth < 3 && validateTestHeader(datum.text, killHeaders)) return true;
  else if (datum.type !== 'heading') return true;
  else return false;
};

/*
 * Bumps a version by release type
 */
exports.bumpVersion = (version, type = 'patch', prerelease = 'beta') => {
  switch (type) {
    case 'prerelease':
      return semver.inc(version, 'prerelease', prerelease);
    case 'patch':
      return semver.inc(version, 'patch');
    case 'minor':
      return semver.inc(version, 'minor');
    case 'major':
      return semver.inc(version, 'major');
    default:
      return semver.inc(version, 'patch');
  }
};

/*
 * Returns a template building function
 */
exports.buildTemplateFunction = (templateFile, defsDir = path.dirname(templateFile), opts = {strip: false}) => {
  // Get the deffiles
  const defFiles = _(fs.readdirSync(defsDir))
    .filter(file => _.endsWith(file, '.def'))
    .map(file => path.join(defsDir, file))
    .value();
  // Build a def object
  const defs = {};
  _.forEach(defFiles, file => {
    defs[path.basename(file, '.def')] = fs.readFileSync(file, 'utf8');
  });
  // Return
  return dot.template(fs.readFileSync(templateFile, 'utf8'), _.merge({}, dot.templateSettings, opts), defs);
};

/*
 * Returns the target OS
 */
exports.cliTargetOs = () => {
  switch (process.platform) {
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'linux';
    case 'win32':
      return 'win';
    default:
      return 'linux';
  }
};

/*
 * Constructs the CLI PKG task
 */
exports.cliPkgTask = output => {
  // Package command
  const pkgCmd = [
    'node',
    path.resolve(__dirname, '..', 'node_modules', 'pkg', 'lib-es5', 'bin.js'),
    '--targets ' + ['node10', exports.cliTargetOs(), 'x64'].join('-'),
    '--config ' + path.join('package.json'),
    '--output ' + output,
    path.join('bin', 'lando.js'),
  ];

  // Start to build the command
  const cmd = [];
  cmd.push('yarn install --production');
  cmd.push(pkgCmd.join(' '));

  // Add executable perms on POSIX
  if (process.platform !== 'win32') {
    cmd.push('chmod +x ' + output);
    cmd.push('sleep 2');
  }

  // Return the CLI build task
  return cmd;
};

/*
 * Scans a directory and finds all the readmes that exist
 * NOTE: only one level down
 */
exports.findReadmes = dir => _(fs.readdirSync(dir))
  .map(file => path.join(dir, file, 'README.md'))
  .filter(file => fs.existsSync(file))
  .value();

/*
 * Fixes a jsdoc2md alias
 */
exports.fixAlias = datum => {
  const needsWrapping = s => !_.startsWith(s, '\'') && !_.endsWith(s, '\'') && _.includes(s, 'lando.');
  if (_.has(datum, 'alias') && needsWrapping(datum.alias)) {
    if (_.startsWith(datum.alias, 'lando.')) {
      datum.name = datum.alias;
      datum.kind = 'function';
      datum.scope = 'global';
      delete datum.memberof;
    }
  }
  return datum;
};

/*
 * Fixes a jsdoc2md alias
 */
exports.parseCommand = (cmd, cwd = path.resolve(__dirname, '..')) => {
  const mode = (process.platform === 'win32') ? {} : {mode: 'collect'};
  return {run: cmd.split(' '), opts: _.merge({}, {cwd}, mode)};
};

/*
 * Parses a README into metadata we can use to generate a test and filters out ones that dont comply
 */
exports.parseReadmes = files => _.filter(_.map(files, file => {
  const content = _(lex(fs.readFileSync(file, 'utf8'))).filter(trimReadmeTypes).filter(trimHeaders).value();
  const tests = mapsOfMeaning(file, content);
  return tests;
}), test => !_.isEmpty(test.start) && !_.isEmpty(test.tests) && !_.isEmpty(test.clean));

/*
 * Run a ps script
 */
exports.psTask = cmd => (['PowerShell -NoProfile -ExecutionPolicy Bypass -Command', cmd, '&& EXIT /B %errorlevel%']);

/*
 * Installer pacakge task
 */
exports.installerPkgTask = () => {
  const extension = (process.platform === 'win32') ? 'ps1' : 'sh';
  const join = (extension === 'sh') ? path.posix.join : path.win32.join;
  const script = join('scripts', `build-${process.platform}.${extension}`);
  return (extension === 'ps1') ? exports.psTask(script).join(' ') : script;
};
