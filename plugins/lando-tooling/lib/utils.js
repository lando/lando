'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * Helper to get command
 */
const getCommand = (cmd, passOpts) => {
  // Extract the command if its an object
  if (_.isObject(cmd)) cmd = cmd[_.first(_.keys(cmd))];
  // Build and return
  const command = [cmd];
  // Strip globaltOpts
  if (process.lando === 'node') command.push(exports.getOpts());
  // Add passOpts
  command.push(passOpts);
  return _.flatten(command).join(' ');
};

/*
 * Helper to get service
 */
const getService = (cmd, service) => (_.isObject(cmd)) ? _.first(_.keys(cmd)) : service;

/*
 * Helper to build commands
 */
exports.buildCommand = (app, command, needs, service, user) => ({
  id: [app.name, service, '1'].join('_'),
  compose: app.compose,
  project: app.name,
  cmd: command,
  opts: {
    app: app,
    mode: 'attach',
    pre: ['cd', exports.getContainerPath(app.root)].join(' '),
    user: user,
    services: _.compact(_.flatten([service, needs])),
    hijack: false,
  },
});

/*
 * Helper to grab dynamic container if needed
 */
exports.getContainer = (service, answer) => (_.startsWith(service, ':')) ? answers[service.split(':')[1]] : service;

/*
 * Helper to map the cwd on the host to the one in the container
 */
exports.getContainerPath = appRoot => {
  // Break up our app root and cwd so we can get a diff
  const cwd = process.cwd().split(path.sep);
  const dir = _.drop(cwd, appRoot.split(path.sep).length);
  // Add our in-container app root
  dir.unshift('"$LANDO_MOUNT"');
  // Return the directory
  return dir.join('/');
};

/*
 * Helper to process args
 *
 * We assume pass through commands so let's use argv directly and strip out
 * the first three assuming they are [node, lando.js, options.name]'
 * Check to see if we have global lando opts and remove them if we do
 */
exports.getOpts = (argopts = process.argv.slice(3)) => {
  return (_.indexOf(argopts, '--') >= 0) ? _.slice(argopts, 0, _.indexOf(argopts, '--')) : argopts;
};

/*
 * Helper to get passthru options
 */
exports.getPassthruOpts = (options = {}, answers = {}) => _(options)
  .filter(value => value.passthrough = true)
  .map(value => `--${value.name} ${answers[value.name]}`)
  .value();

/*
 * Helper to parse tooling config options
 */
exports.parseCommand = (cmd, service, passOpts = []) => _.map(!_.isArray(cmd) ? [cmd] : cmd, command => ({
  command: getCommand(command, passOpts),
  container: getService(command, service),
}));

/*
 * Helper to emit events, run commands and catch errors
 */
exports.runCommands = (name, events, runner, cmds, inject = {}) => events.emit(['pre', name].join('-'), inject)
  // Run commands
  .then(() => runner(cmds))
  // Catch error but hide the stdout
  .catch(error => {
    error.hide = true;
    throw error;
  })
  // Post event
  .then(() => events.emit(['post', name].join('-'), inject));

/*
 * Helper to get defaults
 */
exports.toolingDefaults = ({
  name,
  app = {},
  cmd = name,
  description = `Run ${name} commands`,
  needs = [],
  options = {},
  service = '',
  user = _.get(app, `services[${service}].environment.LANDO_WEBROOT_USER`, 'root')} = {}) =>
  ({
    name: name,
    app: app,
    cmd: cmd,
    description: description,
    needs: needs,
    options: options,
    service: service,
    user: user,
  });
