'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

/*
 * Translate a name for use by docker-compose eg strip `-` and `.` and
 * @TODO: Eventually we want to get rid of this since it should only happen once
 * on the appName itself
 */
exports.dockerComposify = data => _.toLower(data).replace(/_|-|\.+/g, '');

/*
 * Escapes any spaces in a command.
 */
exports.escSpaces = (s, platform = process.platform) => {
  if (_.isArray(s)) s = s.join(' ');
  return (platform === 'win32') ? s.replace(/ /g, '^ ') : s.replace(/ /g, '\ ');
};

/*
 * Helper to return a valid id from app data
 */
exports.getId = c => c.cid || c.id || c.containerName || c.containerID || c.name;

/*
 * We might have datum but we need to wrap in array so Promise.each knows
 * what to do
 */
exports.normalizer = data => (!_.isArray(data)) ? [data] : data;

/*
 * Helper to move config from lando to a mountable directory
 */
exports.moveConfig = (src, dest) => {
   // Copy opts and filter out all js files
   // We dont want to give the false impression that you can edit the JS
   const copyOpts = {
     overwrite: true,
     filter: function(file) {
       return (path.extname(file) !== '.js');
     },
   };

   // Ensure to exists
   fs.mkdirpSync(dest);

   // Try to copy the assets over
   try {
     fs.copySync(src, dest, copyOpts);
   } catch (error) {
     const code = _.get(error, 'code');
     const syscall = _.get(error, 'syscall');
     const f = _.get(error, 'path');

     // Catch this so we can try to repair
     if (code !== 'EISDIR' || syscall !== 'open' || !!fs.mkdirpSync(f)) {
       throw new Error(error);
     }

     // Try to take corrective action
     fs.unlinkSync(f);
     fs.copySync(src, dest, copyOpts);
   };

   // Return the new scripts directory
   return dest;
 };
