'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/utils');

/*
 * Build CA service
 */
module.exports = {
  name: '_mounter',
  parent: '_lando',
  config: {
    version: 'custom',
    type: 'mounter',
    name: 'mounter',
  },
  builder: (parent, config) => class LandoMounter extends parent {
    constructor({userConfRoot, gid, uid}, app, excludes = []) {
      const mountService = {
        services: {
          mounter: {
            command: 'tail -f /dev/null',
            image: 'devwithlando/util:3',
            environment: {
              LANDO_HOST_UID: uid,
              LANDO_HOST_GID: gid,
            },
            labels: {},
          },
        },
        volumes: utils.getNamedVolumes(excludes),
      };
      // Add in named volume mounts
      mountService.services.mounter.volumes = utils.getServiceVolumes(excludes);
      mountService.services.mounter.volumes.push(`${app}:/source:cached`);
      // Add moar stuff
      mountService.services.mounter.environment.LANDO_SERVICE_TYPE = 'mounter';
      mountService.services.mounter.labels['io.lando.service-container'] = 'TRUE';
      mountService.services.mounter.labels['io.lando.mount-container'] = 'TRUE';
      super('mounter', _.merge({}, config, {userConfRoot}), mountService);
    };
  },
};

