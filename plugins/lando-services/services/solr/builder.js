'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to parse legacy solr 3 config
 */
const parse3 = options => {
  options.image = 'actency/docker-solr:3.6';
  options.command = '/bin/bash -c "cd /opt/solr/example; java -Djetty.port=8983 -jar start.jar"';
  options.remoteFiles.dir = '/opt/solr/example/solr/conf';
  options.dataDir = '/opt/solr/example/solr/data';
  return options;
};

/*
 * Helper to parse legacy solr 4 config
 */
const parse4 = options => {
  options.image = 'actency/docker-solr:4.10';
  options.command = '/bin/bash -c "/opt/solr/bin/solr -f -p 8983"';
  options.remoteFiles.dir = '/opt/solr-4.10.4/example/solr/collection1/conf';
  // @TODO: the below doesnt seem to work so lets just ignore for now sice 4.10 is legacy
  // options.dataDir = '/opt/solr-4.10.4/example/solr/collection1/data';
  options.dataDir = '';
  return options;
};

/*
 * Helper to parse generic solr config
 */
const parseElse = options => {
  options.image = `solr:${options.version}`;
  options.command = `docker-entrypoint.sh solr-precreate ${options.core}`;
  // Custom config dir command
  // @NOTE: idiot drupal hardcodes solrcore.properties so we need to do chaos like this
  if (_.has(options, 'config.dir')) {
    options.command = [
      '/bin/sh',
      '-c',
      '"echo \"solr.install.dir=/opt/solr\" >> /solrconf/conf/solrcore.properties',
      '&&',
      `${options.command} /solrconf"`,
    ].join(' ');
  }
  return options;
};

/*
 * Helper to return admin port to expose
 */
const getAdminPort = options => {
  switch (options.version) {
    case '3.6': return [];
    case '3': return [];
    case '4.10': return [];
    case '4': return [];
    default: return ['8983'];
  };
};

/*
 * Helper to parse solr config
 */
const parseConfig = options => {
  switch (options.version) {
    case '3.6': return parse3(options);
    case '3': return parse3(options);
    case '4.10': return parse4(options);
    case '4': return parse4(options);
    default: return parseElse(options);
  };
};

/*
 * Helper to get core
 */
const getCore = options => {
  switch (options.version) {
    case '3.6': return 'not supported';
    case '3': return 'not supported';
    case '4.10': return 'not supported';
    case '4': return 'not supported';
    default: return options.core;
  };
};

// Builder
module.exports = {
  name: 'solr',
  config: {
    version: '7',
    supported: ['7.6', '7', '6.6', '6', '5.5', '5', '4.10', '4', '3.6', '3'],
    legacy: ['4.10', '4', '3.6', '3'],
    patchesSupported: true,
    confSrc: __dirname,
    core: 'lando',
    dataDir: '/opt/solr/server/solr/mycores',
    moreHttpPorts: ['8983'],
    port: '8983',
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
        command: options.command,
        volumes: [],
        ports: getAdminPort(options),
      };
      // Add in persistent datadir
      if (!_.isEmpty(options.dataDir)) solr.volumes.push(`${options.data}:${options.dataDir}`);
      // Add some info
      options.info = {core: getCore(options)};
      // Set the healthcheck
      if (getCore(options) !== 'not supported') {
        const core = getCore(options);
        options.healthcheck = `curl http://localhost:8983/solr/${core}/admin/ping`;
      }
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, solr)});
    };
  },
};
