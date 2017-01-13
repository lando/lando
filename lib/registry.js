/**
 * Handles app registration.
 *
 * @name registry
 */

'use strict';

var _ = require('./node')._;
var config = require('./config');
var fs = require('./node').fs;
var path = require('path');
var log = require('./logger');
var Promise = require('./promise');
var serializer = new require('./serializer')();
var yaml = require('./node').yaml;

// Singleton data store for app directories.
var appCache = {};

// Returns true if two apps are equal.
function appsAreEqual(x, y) {
  function pp(o) {
    return JSON.stringify(o);
  }
  var xs = pp(x);
  var ys = pp(y);
  return xs === ys;
}

// Returns true if app already exists in cache.
function existsInCache(x, cache) {
  var found = _.find(cache, function(y) {
    return appsAreEqual(x, y);
  });
  return !!found;
}

// Cache an appDir by appName in data store.
var cacheApp = function(app) {
  if (!appCache.good) {
    appCache.good = [];
  }
  if (!existsInCache(app, appCache.good)) {
    appCache.good.push(app);
  }
};

// Cache an appDir by appName in bad app data store.
var cacheBadApp = function(app) {
  if (!appCache.bad) {
    appCache.bad = [];
  }
  if (!existsInCache(app, appCache.bad)) {
    appCache.bad.push(app);
  }
};

// Clear out caches
var cacheClear = function() {
  appCache = {};
};

// Read from app registry file.
var getAppRegistry = function() {

  // Read contents of app registry file.
  return Promise.fromNode(function(cb) {
    fs.readFile(config.appRegistry, {encoding: 'utf8'}, cb);
  })
  // Parse contents and return app dirs.
  .then(function(data) {
    var json = JSON.parse(data);
    if (json) {
      return json;
    } else {
      return [];
    }
  })
  // Handle no entry error.
  .catch(function(err) {
    if (err.code === 'ENOENT') {
      return [];
    } else {
      throw err;
    }
  });

};

// Rewrite the app registry file.
var setAppRegistry = function(apps) {

  var filepath = config.appRegistry;
  var tempFilepath = filepath + '.tmp';

  // Write to temp file.
  return Promise.fromNode(function(cb) {
    fs.writeFile(tempFilepath, JSON.stringify(apps), cb);
    log.debug('Setting app registry with %j', apps);
  })
  // Rename temp file to normal file.
  .then(function() {
    return Promise.fromNode(function(cb) {
      fs.rename(tempFilepath, filepath, cb);
    });
  });

};

// Given an app, inspect it and return the appName.
var inspectDir = function(app) {

  var filepath = path.join(app.dir, config.configFilename);

  // Read contents of file.
  return Promise.fromNode(function(cb) {
    fs.readFile(filepath, {encoding: 'utf8'}, cb);
  })
  // Handle no entry error.
  .catch(function(err) {
    if (err.code === 'ENOENT') {
      cacheBadApp(app);
    } else {
      throw new Error(err, 'Failed to load config: %s', filepath);
    }
  })
  // Return appName.
  .then(function(data) {
    var json = yaml.safeLoad(data);
    if (!json) {
      return null;
    }
    else if (!json.name) {
      log.debug('Does NOT contain %s property!', filepath);
      return null;
    }
    else if (json.name === app.name) {
      cacheApp(app);
      return app;
    }
    else if (json.name !== app.name) {
      cacheBadApp(app);
      return null;
    }
    else {
      return null;
    }
  });

};

// Inspect a list of directories, return list of appNames.
var inspectDirs = function(apps) {
  return Promise.map(apps, inspectDir)
  .all()
  .filter(_.identity);
};

// Return list of app names from app registry dirs.
var list = function() {
  // Get list of dirs from app registry.
  return getAppRegistry()
  // Map app dirs to app names.
  .then(inspectDirs)
  .all()
  .tap(function(appRegistryApps) {
    log.debug('Apps in registry: %j', appRegistryApps);
  });

};

// Get app helped
var getAppCache = function(cache) {
  // Init a promise.
  return Promise.resolve()
  .then(function() {

    if (!_.isEmpty(appCache)) {
      // Return cached value.
      return appCache[cache] || [];
    } else {
      // Reload and cache app dirs, then get app dir from cache again.
      return list()
      .then(function() {
        return appCache[cache] || [];
      });
    }

  });
};

/**
 * Gets a list of apps.
 */
var getApps = exports.getApps = function(opts) {
  opts = opts || {};
  opts.useCache = opts.useCache === undefined ? true : opts.useCache;
  if (!opts.useCache) {
    cacheClear();
  }
  return getAppCache('good');
};

/**
 * Gets a list of potentially corrupted apps.
 */
exports.getBadApps = function() {
  return getAppCache('bad');
};

var actionApp = function(app, action) {

  // Get app dirs.
  return getApps()
  .then(function(apps) {

    // Check if we already have an app with this name
    var alreadyExists = _.find(apps, function(a) {
      return a.name === app.name;
    });

    // Go through add checks
    if (action === 'add' && !alreadyExists) {
      apps.push(app);
      return setAppRegistry(apps).then(cacheClear);
    }

    // Go through remove checks
    else if (action === 'remove' && alreadyExists) {
      _.remove(apps, function(b) {
        return b.name === app.name;
      });
      return setAppRegistry(apps).then(cacheClear);
    }

  });

};

/**
 * Adds an app to the app registry.
 */
exports.register = function(app) {
  // Run through serializer.
  return serializer.enqueue(function() {
    // Add the app
    return actionApp(app, 'add');
  });
};

/**
 * Remove app from registry
 */
exports.remove = function(app) {
  // Run through serializer.
  return serializer.enqueue(function() {
    // Remove the app
    return actionApp(app, 'remove');
  });
};
