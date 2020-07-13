'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const utils = require('./../../../lib/utils');

// Helper to kill a run
const killRun = config => ({
  id: config.id,
  compose: config.compose,
  project: config.project,
  opts: {
    purge: true,
    mode: 'attach',
  },
});

// Helper to get a build array of run thingz
exports.buildRun = config => ({
  id: config.id,
  compose: config.compose,
  project: config.project,
  cmd: config.cmd,
  opts: {
    mode: 'attach',
    user: config.user,
    services: ['init'],
    autoRemove: config.remove,
  },
});

// Helper to run
exports.run = (lando, run) => lando.engine.run(run).catch(err => {
  return lando.engine.stop(killRun(run))
  .then(() => lando.engine.destroy(killRun(run)))
  .then(() => lando.Promise.reject(err));
});

// Helper to get run defaults
exports.runDefaults = (lando, options) => {
  // Handle all the compose stuff
  const LandoInit = lando.factory.get('_init');
  const initData = new LandoInit(
    lando.config.userConfRoot,
    lando.config.home,
    options.destination,
    _.cloneDeep(lando.config.appEnv),
    _.cloneDeep(lando.config.appLabels)
  );
  const initDir = path.join(lando.config.userConfRoot, 'init', options.name);
  const initFiles = lando.utils.dumpComposeData(initData, initDir);
  // Start to build out some propz and shiz
  const project = `${lando.config.product}init` + utils.dockerComposify(options.name);
  // Return
  return {
    id: `${project}_init_1`,
    project,
    user: 'www-data',
    compose: initFiles,
    remove: false,
  };
};
