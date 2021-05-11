'use strict';

// Modules
const _ = require('lodash');

// Versions
const supportedVersions = [
  '8.6',
  '8.5',
  '8.4',
  '8.3',
  '8.2',
  '8.1',
  '8.0',
  '8',
  '7.7',
  '7.6',
  '7',
  '6.6',
  '6',
  '5.5',
  '5',
  '4.10',
  '4',
  '3.6',
  '3',
];

/*
 * Helper to parse legacy solr 3 config
 */
const parse3 = options => {
  options.image = 'actency/docker-solr:3.6';
  options.remoteFiles.dir = '/opt/solr/example/solr/conf';
  options.dataDir = '/opt/solr/example/solr/data';
  options.startScript = 'start-solr-3.sh';
  options.moreHttpPorts = [];
  return options;
};

/*
 * Helper to parse legacy solr 4 config
 */
const parse4 = options => {
  options.image = 'actency/docker-solr:4.10';
  options.remoteFiles.dir = '/opt/solr-4.10.4/example/solr/collection1/conf';
  options.dataDir = '/opt/solr-4.10.4/example/solr/collection1/data';
  options.startScript = 'start-solr-4.sh';
  options.moreHttpPorts = [];
  return options;
};

/*
 * Helper to parse legacy solr 4 config
 */
const parse8 = options => {
  options = parseElse(options);
  options.dataDir = '/var/solr/data';
  return options;
};

/*
 * Helper to parse generic solr config
 */
const parseElse = options => {
  options.image = `solr:${options.version}`;
  // Custom config dir command
  if (_.has(options, 'config.dir')) options.command = `${options.command} ${options.config.dir}`;
  return options;
};

/*
 * Helper to get core
 */
const getCore = options => {
  switch (options.version) {
    case 'custom': return 'not supported';
    case '3.6': return 'not supported';
    case '3': return 'not supported';
    case '4.10': return 'collection1';
    case '4': return 'collection1';
    default: return options.core;
  };
};

/*
 * Helper to get the environment
 */
const getEnvironment = options => ({
  LANDO_SOLR_CONFDIR: options.remoteFiles.dir,
  LANDO_SOLR_CORE: options.core,
  LANDO_SOLR_CUSTOM: _.get(options, 'config.dir', 'none'),
  LANDO_SOLR_DATADIR: options.dataDir,
  LANDO_SOLR_INSTALL_DIR: '/opt/solr',
  LANDO_WEBROOT_USER: 'solr',
  LANDO_WEBROOT_GROUP: 'solr',
  LANDO_WEBROOT_UID: '8983',
  LANDO_WEBROOT_GID: '8983',
});

/*
 * Helper to parse solr config
 */
const parseConfig = options => {
  switch (options.version) {
    case '3.6': return parse3(options);
    case '3': return parse3(options);
    case '4.10': return parse4(options);
    case '4': return parse4(options);
    case '8.6': return parse8(options);
    case '8.5': return parse8(options);
    case '8.4': return parse8(options);
    case '8.3': return parse8(options);
    case '8.2': return parse8(options);
    case '8.1': return parse8(options);
    case '8.0': return parse8(options);
    case '8': return parse8(options);
    default: return parseElse(options);
  };
};

// Builder
module.exports = {
  name: 'solr',
  config: {
    version: '7',
    supported: supportedVersions,
    legacy: ['4.10', '4', '3.6', '3'],
    patchesSupported: true,
    command: '/start-solr.sh',
    confSrc: __dirname,
    core: 'lando',
    dataDir: '/opt/solr/server/solr/mycores',
    moreHttpPorts: ['8983'],
    port: '8983',
    startScript: 'start-solr.sh',
    remoteFiles: {
      dir: '/solrconf/conf',
    },
  },
  parent: '_service',
  builder: (parent, config) => class LandoSolr extends parent {
    constructor(id, options = {}) {
      options = parseConfig(_.merge({}, config, options));
      const solr = {
        image: options.image,
        command: `/bin/sh -c "${options.command}"`,
        environment: getEnvironment(options),
        volumes: [
          `${options.confDest}/${options.startScript}:/start-solr.sh`,
        ],
        user: 'root',
      };
      // Add in persistent datadir
      if (!_.isEmpty(options.dataDir)) solr.volumes.push(`${options.data}:${options.dataDir}`);
      // Change the me user
      options.meUser = 'solr';
      // Add some info
      options.info = {core: getCore(options)};
      // Set the supported things
      if (getCore(options) !== 'not supported') {
        const core = getCore(options);
        options.healthcheck = `curl http://localhost:8983/solr/${core}/admin/ping`;
      }
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, solr)});
    };
  },
};
