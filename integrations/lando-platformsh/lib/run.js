'use strict';

// Modules
const _ = require('lodash');
const overrides = require('./overrides');
const path = require('path');
const utils = require('./utils');

// Constants
const applicationConfigDefaults = {
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
  size: 'AUTO',
  variables: {},
};

/*
 * Helper to encode into a base64 string
 */
const encode = data => {
  if (_.isObject(data)) data = JSON.stringify(data);
  return Buffer.from(data).toString('base64');
};

/*
 * Helper to get the applications environment variables
 */
const getEnvironmentVariables = appConfig => _(_.get(appConfig, 'variables.env', {}))
  .map((value, key) => ([key, (_.isObject(value)) ? JSON.stringify(value) : value]))
  .fromPairs()
  .value();

/*
 * Helper to get the applications environment variables
 */
const getPlatformVariables = app => {
  const strippedVars = _.omit(_.get(app, 'variables', {}), ['env']);

  // Loop through and try to build things out
  const vars = {};
  _.forEach(strippedVars, (value, key) => {
    if (_.isPlainObject(value)) {
      // @NOTE sorry to my CS teacher for these names
      _.forEach(value, (value2, key2) => {
        vars[`${key}:${key2}`] = value2;
      });
    } else {
      vars[key] = value;
    }
  });

  // Merge in needed local overrides and encode
  return encode(_.merge({}, vars, overrides));
};

/*
 * Helper to build the application configuration
 */
const getApplicationConfig = (app, {id}) => ({
  configuration: _.merge({}, applicationConfigDefaults, app, {
    slug: `${id}-${app.name}`,
    tree_id: `${id}-${app.name}`,
    variables: {},
  }),
  crons: _.get(app, 'crons', {}),
  cron_minimum_interval: '1',
  enable_smtp: 'false',
  mounts: _.get(app, 'mounts', {}),
  slug: `${id}-${app.name}`,
});

/*
 * Helper to parse the platformsh config files
 */
const getApplicationsConfig = (apps, config) => _(apps)
  // Start by just getting the basic config
  .map(app => getApplicationConfig(app, config))
  // Then fix some things up we need for platform
  .map(app => {
    // Reset the variables
    app.configuration.variables = getApplicationEnvironment(app.configuration, config);

    // Find the web prefix
    const appName = _.get(app, 'configuration.name');
    const appConfig = _.find(config.applications, {name: appName});
    const webPrefix = appConfig.webPrefix;

    // Go through the web location and prefix the root if we need to
    // @NOTE: We do this because for multiapp we still mount the ENTIRE
    // application into /app, not just the source.root
    _.forEach(_.get(app, 'configuration.web.locations'), block => {
      if (_.has(block, 'root')) block.root = path.join(webPrefix, block.root);
    });

    // app.configuration.web.locations['/'].root = 'php/web';
    return app;
  })
  // and return
  .value();

/*
 * Helper to get the application environment
 *
 * Handle the variables with the exception of PLATFORM_RELATIONSHIPS
 * which is special and needs to be handled separately
 */
const getApplicationEnvironment = (appConfig, config) => _.merge({}, getEnvironmentVariables(appConfig), {
  PLATFORM_DOCUMENT_ROOT: utils.getDocRoot(appConfig),
  PLATFORM_APPLICATION: encode(appConfig),
  // @NOTE: PLATFORM_APP_DIR is normally set to /app but this is problematic locally
  // eg on Drupal this puts the /tmp and /private at /app/tmp and /app/private and
  // we probably dont want these things ending up in git
  //
  // That said changing this could def be problematic for other reasons
  // PLATFORM_APP_DIR: '/app',
  PLATFORM_ENVIRONMENT: 'lando',
  PLATFORM_APPLICATION_NAME: appConfig.name,
  PLATFORM_PROJECT: config.id,
  PLATFORM_DIR: '/app',
  PLATFORM_PROJECT_ENTROPY: encode(appConfig),
  PLATFORM_BRANCH: 'master',
  PLATFORM_TREE_ID: `${config.id}-${appConfig.name}`,
  PLATFORM_ROUTES: encode(config.routes),
  PLATFORM_VARIABLES: getPlatformVariables(appConfig),
});

/*
 * Helper to build the service configurations
 */
const getServiceConfig = (id, name) => ({
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
 * Helper to generate our platform JSON
 */
const getPlatformConfig = ({id, name, platformsh, _config}, service = {}) => {
  const externalIP = _.get(_config, 'appEnv.LANDO_HOST_IP');
  const uid = _.toInteger(_.get(_config, 'uid', 1000));
  const gid = _.toInteger(_.get(_config, 'gid', 1000));

  // Start with all the application
  let applications = platformsh.config.applications;
  // But if its application service lets only use that one
  if (service.application) {
    applications = _(applications)
      .filter(application => application.name === service.name)
      .value();
  }

  return {
    primary_ip: '127.0.0.1',
    features: [],
    domainname: `${name}.${service.name}.service._.lndo.site`,
    host_ip: externalIP,
    applications: getApplicationsConfig(applications, platformsh),
    configuration: _.merge({application_size: 536}, getServiceConfig(id, name), service.configuration),
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
    log_file: '/dev/stderr',
    log_gid: gid,
    log_uid: uid,
    name: name,
    service: service.name,
    cluster: 'bespin',
    region: 'lando',
    hostname: service.hostname,
    instance: _.get(_config, 'instance', 'lando'),
    nameserver: '127.0.0.11',
    web_gid: gid,
    web_uid: uid,
  };
};

/*
 * Helper to build the /run/config.json for each service
 */
exports.buildRunConfig = app => _(app.platformsh.applications)
  // Add some indicator that this is an app
  .map(app => _.merge({}, app, {application: true}))
  // Arrayify and merge in our services
  .concat(app.platformsh.services)
  // Map into the full blown config
  .map(service => ({
    service: service.name,
    application: service.application,
    file: path.join(app.configPath, `${service.name}.json`),
    data: getPlatformConfig(app, service),
  }))
  // Return
  .value();
