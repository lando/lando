'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'elasticsearch',
  config: {
    version: '6',
    supported: ['6', '5'],
    patchesSupported: true,
    confSrc: __dirname,
    plugins: [],
    port: '9200',
    mem: '1025m',
    defaultFiles: {
      config: 'config.yml',
    },
    remoteFiles: {
      config: '/opt/bitnami/elasticsearch/config/elasticsearch_custom.yml',
    },
  },
  parent: '_service',
  builder: (parent, config) => class LandoElasticSearch extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      const elasticsearch = {
        image: `bitnami/elasticsearch:${options.version}`,
        command: '/entrypoint.sh /run.sh',
        environment: {
          ELASTICSEARCH_IS_DEDICATED_NODE: 'yes',
          ELASTICSEARCH_CLUSTER_NAME: 'bespin',
          ELASTICSEARCH_NODE_TYPE: 'master',
          ELASTICSEARCH_NODE_NAME: 'lando',
          ELASTICSEARCH_PORT_NUMBER: 9200,
          ELASTICSEARCH_PLUGINS: options.plugins.join(';'),
          ELASTICSEARCH_HEAP_SIZE: options.mem,
        },
        working_dir: '/bitnami/elasticsearch/data',
        volumes: [
          `${options.confDest}/${options.defaultFiles.config}:${options.remoteFiles.config}`,
          `data_${options.name}:/bitnami/elasticsearch/data`,
        ],
      };
      // Add some info
      options.info = {environment: elasticsearch.environment};
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, elasticsearch)});
    };
  },
};
