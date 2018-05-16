'use strict';

// Modules
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');

/**
 * Translate a name for use by docker-compose eg strip `-` and `.` and
 * @TODO: Eventually we want to get rid of this since it should only happen once
 * on the appName itself
 *
 * @since 3.0.0
 * @alias 'lando.utils.engine.dockerComposify'
 */
exports.dockerComposify = function(data) {
  return _.toLower(data).replace(/_|-|\.+/g, '');
};

/*
 * Escapes any spaces in a command.
 *
 * @since 3.0.0
 * @param {Array} s - A command as elements of an Array or a String.
 * @return {String} The space escaped cmd.
 * @example
 *
 * // Escape the spaces in the cmd
 * var escapedCmd = lando.shell.escSpaces(['git', 'commit', '-m', 'my message']);
 */
exports.escSpaces = function(s, platform) {

  var p = platform || process.platform;

  if (_.isArray(s)) {
    s = s.join(' ');
  }
  if (p === 'win32') {
    return s.replace(/ /g, '^ ');
  }
  else {
    return s.replace(/ /g, '\ ');
  }
};

/**
 * Helper to return a valid id from app data
 *
 * @since 3.0.0
 * @alias 'lando.utils.engine.getId'
 */
exports.getId = function(c) {
  return c.cid || c.id || c.containerName || c.containerID || c.name;
};

/**
 * We might have datum but we need to wrap in array so Promise.each knows
 * what to do
 *
 * @since 3.0.0
 * @alias 'lando.utils.engine.normalizer'
 */
exports.normalizer = function(data) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  return data;
};

/**
 * Helper to move config from lando to a mountable directory
 *
 * @since 3.0.0
 * @alias 'lando.utils.engine.moveConfig'
 */
exports.moveConfig = function(from, to) {

   // Copy opts and filter out all js files
   // We dont want to give the false impression that you can edit the JS
   var copyOpts = {
     overwrite: true,
     filter: function(file) {
       return (path.extname(file) !== '.js');
     }
   };

   // Ensure to exists
   fs.mkdirpSync(to);

   // Try to copy the assets over
   try {
     fs.copySync(from, to, copyOpts);
   }

   // If we have an EPERM, try to remove the file/directory and then retry
   catch (error) {

     // Parse the error for dataz
     var code = _.get(error, 'code');
     var syscall = _.get(error, 'syscall');
     var f = _.get(error, 'path');

     // Catch this so we can try to repair
     if (code !== 'EISDIR' || syscall !== 'open' || !!fs.mkdirpSync(f)) {
       throw new Error(error);
     }

     // Try to take corrective action
     fs.unlinkSync(f);

     // Try to move again
     fs.copySync(from, to, copyOpts);

   }

   // Return the new scripts directory
   return to;

 };
