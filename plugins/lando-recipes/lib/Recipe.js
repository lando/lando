/**
* Recipe construct.
* @name Recipe
*/

'use strict';

/**
* Recipes are a collection of Services and Tools
* that implement common tech stacks.
*/
class Recipe {

  /**
  * Recipe Constructor
  * @param {object} lando Global Lando object to access modules.
  */
  constructor(lando) {
    // Modules
    this.lando = lando;
    this._ = this.lando.node._;

    // fields
    this.proxyData = {};
    this.serviceData = {};
    this.toolingData = {};

    // bindings
    this.build = this.build.bind(this);
    this.tooling = this.tooling.bind(this);
    this.services = this.services.bind(this);
  }

  /**
  * Builds a Recipe object for consumption by Lando.
  *
  * @param  string name   App name.
  * @param  object config Configuration.
  * @return object        Build object.
  */
  build(name, config) {
    return {
      proxy:  this.proxy(name),
      services: this.services(config),
      tooling: this.tooling(config)
    };
  }

  /**
   * Helper to inject cache config
   * @param  {[type]} cache   Cache config
   * @return {object}         Config.
   */
  cache(cache) {
    let config = {};
    // Return redis
    if (this._.includes(cache, 'redis')) {
      config = {
        type: cache,
        portforward: true,
        persist: true
      };
    }
    // Or memcached
    else if (this._.includes(cache, 'memcached')) {
      config = {
        type: cache,
        portforward: true
      };
    }
    return config;
  }

  /**
   * Inject database credentials into appserver environment variables.
   *
   * @param  {object} config  Config.
   * @return {self}   this    Recipe
   */
  injectDbCreds(config) {
    this.serviceData.appserver.overrides = {
      services: {
        environment: {
          DB_HOST: 'database',
          DB_USER: this.serviceData.database.creds.user,
          DB_PASSWORD: this.serviceData.database.creds.password,
          DB_NAME: this.serviceData.database.creds.database,
          DB_PORT: this.includesPostgres(config) ? 5432 : 3306,
        }
      }
    };
    return this.serviceData;
  }

  /**
   * Inject Cache service if defined.
   * @param  {object} config Config.
   * @return {self}   this     Recipe
   */
  injectCache(config) {
    // Add in cache func if needed
    if (this.includesCache(config)) {
      // Add the cache service
      this.serviceData.cache = this.cache(config.cache);

      // Add cache credentials into the ENV
      let cacheCreds = {
        CACHE_HOST: 'cache',
        CACHE_PORT: (this._.includes(config.cache, 'redis')) ? 6379 : 11211
      };

      // Merge in cache creds
      let envKey = 'services.appserver.overrides.services.environment';
      this._.set(this.buildData, envKey, this._.merge(this._.get(this.buildData, envKey), cacheCreds));

      // Add it as something our tooling needs
      this.needs.push('cache');
    }
    return this;
  }

  /**
   * Pull in custom config from user.
   * @param  {object} config  Config.
   * @return {self}   this    Recipe
   */
  mixinConf(config) {
    if (this._.has(config, 'webroot')) {
      this.serviceData.appserver.webroot = config.webroot;
    }
    if (this._.has(config, 'conf')) {

      // Start setting config
      this.serviceData.database.config = {};

      let database = this.getDbType(config);

      // Set custom DB conf
      if (this._.has(config, 'conf.database')) {
        var confKey = (this._.includes(database, 'postgres')) ? 'postgres' : 'confd';
        this.serviceData.database.config[confKey] = config.conf.database;
      }
    }
    return this;
  }

  /**
   * Configure Proxy entries
   *
   * @param  {string} name Name of application.
   * @return {object}      Proxy configuration.
   */
  proxy(name) {
    return {
      appserver: [
        [name, this.lando.config.proxyDomain].join('.')
      ]
    };
  }

  /**
   * Configure Services.
   *
   * @param  {object} config  Config.
   * @return {object}         Service data.
   */
  services(config) {

    // Mix in any additional config
    this.mixinConf(config);
    // Add db credentials into the ENV
    this.injectDbCreds(config);
    return this.serviceData;
  }

  /**
   * Configure Tooling.
   *
   * @param  {object} config  Config.
   * @return {object}         Tooling config.
   */
  tooling(config) {
    this.addDbTooling(config);
    return this.toolingData;
  }

  /**
   * Check if application config includes cache definition.
   *
   * @param  {object} config  Config.
   * @return {bool}
   */
  includesCache(config) {
    return this._.has(config, 'cache');
  }

  /**
   * Check if application config includes MySQL database.
   *
   * @param  {object} config  Config.
   * @return {bool}
   */
  includesMySQL(config) {
    let database = this.getDbType(config);
    return this._.includes(database, 'mysql') ||
      this._.includes(database, 'mariadb');
  }

  /**
   * Check if application config includes PostreSQL database.
   *
   * @param  {object} config  Config.
   * @return {bool}
   */
  includesPostgres(config) {
    return this._.includes(this.getDbType(config), 'postgres');
  }

  /**
   * Retrieve the type of database (MySQL/PostreSQL).
   *
   * @param  {config} config  Config.
   * @return {string}         The type of database.
   */
  getDbType(config) {
    return this._.get(config, 'database', 'postgres');
  }

  /**
   * Add in database tooling entries.
   *
   * @param {object} config  Config.
   * @return {self}  this    Recipe.
   */
  addDbTooling(config) {
    // Add in the DB cli based on choice
    if (this.includesMySQL(config)) {
      this.toolingData.mysql = {
        service: 'database',
        description: 'Drop into a MySQL shell',
        user: 'root'
      };
    }
    else if (this.includesPostgres(config)) {
      // @todo: also need a pgimport cmd
      this.toolingData.pgsql = {
        service: 'database',
        description: 'Drop into a pgsql shell',
        cmd: [
          'psql',
          '-h',
          'localhost',
          '-p',
          '5432',
          config._recipe,
          config._recipe
        ],
        user: 'root'
      };
    }
    return this;
  }

}

module.exports = Recipe;
