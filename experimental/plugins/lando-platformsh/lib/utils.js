'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

// Const
const appConfigDefaults = {
  app_dir: '/app',
  hooks: {
    _deploy: null,
    build: null,
    post_deploy: null,
  },
  timezone: null,
  disk: 2048,
  web: {
    move_to_root: false,
  },
  is_production: false,
  access: {},
  preflight: {
    enabled: true,
    ignored_rules: [],
  },
  resources: null,
  runtime: {},
};

/*
 * Helper to get the application service hostname
 */
const getAppHostname = (name, apps = []) => `app.${_.findIndex(apps, {name})}`;

/*
 * Helper to return the php appserver recipe config
 */
const getPhpAppserver = (config = {}) => ({
  // CAN WE MAKE THE BELOW QUIET?
  // @TODO: this needs to be on all services right?
  build_as_root_internal: [
    '/helpers/boot-psh.sh',
    '/etc/platform/boot',
  ],
});

/*
 * Helper to build the service configurations
 */
const getApplicationConfig = (id, application = {}) => ({
  crons: _.get(application, 'crons', {}),
  enable_smtp: 'false',
  mounts: _.get(application, 'mounts', {}),
  cron_minimum_interval: '1',
  configuration: _.merge({}, appConfigDefaults, application, {
    size: 'AUTO',
    slug: `${id}-${application.name}`,
    tree_id: `${id}-${application.name}`,
    // @TODO: something to build this we are just hardcoding for now
    variables: {
      PLATFORM_DOCUMENT_ROOT: '/app/web',
      PLATFORM_APPLICATION: 'e30=',
      PLATFORM_ENVIRONMENT: 'lando',
      PLATFORM_APPLICATION_NAME: application.name,
      PLATFORM_PROJECT: id,
      PLATFORM_DIR: '/app',
      PLATFORM_PROJECT_ENTROPY: '',
      PLATFORM_BRANCH: 'master',
      PLATFORM_TREE_ID: `${id}-${application.name}`,
      PLATFORM_ROUTES: 'e30=',
      PLATFORM_VARIABLES: 'e30=',
    },
  }),
  slug: `${id}-${application.name}`,
});

/*
 * Helper to build the service configurations
 */
const getServiceConfig = ({id, configuration, name}) => _.merge({}, configuration, {
  access: {},
  project_info: {
    name: id,
    settings: {
      variables_prefix: 'PLATFORM_',
      crons_in_git: false,
      product_code: 'platformsh',
      product_name: 'Platform.sh',
      enforce_mfa: false,
      // @NOTE: we kept this because it was flagged by @ralt as SUPER IMPORTANT ;)
      bot_email: 'bot@platform.sh',
    },
  },
  environment_info: {
    is_production: false,
    machine_name: name,
    name: id,
    is_main: true,
  },
});

/*
 * Helper to get terminus tokens
 */
exports.getAppserver = (type, config = {}) => {
  switch (type) {
    case 'php': return getPhpAppserver(config);
  };
};

/*
 * Helper to generate our platform JSON
 */
exports.getPlatformConfig = (app, service = {}) => {
  const applications = _.get(app, 'config.platformsh.apps', []);
  const externalIP = _.get(app, '_config.appEnv.LANDO_HOST_IP');
  return {
    primary_ip: '0.0.0.0',
    features: [],
    domainname: `${app.name}.${service.name}.service._.lndo.site`,
    host_ip: externalIP,
    applications: _(applications).map(application => getApplicationConfig(app.id, application)).value(),
    configuration: _.merge({}, getServiceConfig(_.merge({}, service, {id: app.id}))),
    info: {
      'mail_relay_host': null,
      'mail_relay_host_v2': null,
      'limits': {
        disk: _.get(service, 'disk', 2048),
        memory: 2048,
        cpu: 1,
      },
      'external ip': externalIP,
    },
    name: app.name,
    service: service.name,
    cluster: 'bespin',
    region: 'lando',
    hostname: (service.application) ? getAppHostname(service.name, applications) : service.name,
    instance: _.get(app, '_config.instance', 'lando'),
    nameserver: null,
  };
};

/*
 * Helper to get terminus tokens
 */
exports.getPlatformshTokens = home => {
  if (fs.existsSync(path.join(home, '.platformsh', 'cache', 'tokens'))) {
    return _(fs.readdirSync(path.join(home, '.platformsh', 'cache', 'tokens')))
      .map(tokenFile => path.join(home, '.platformsh', 'cache', 'tokens', tokenFile))
      .map(file => JSON.parse(fs.readFileSync(file, 'utf8')))
      .value();
  } else {
    return [];
  }
};

/*
 * Helper to return most recent tokens
 */
exports.sortTokens = (...sources) => _(_.flatten([...sources]))
  .sortBy('date')
  .groupBy('email')
  .map(tokens => _.last(tokens))
  .value();
