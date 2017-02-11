'use strict';

var path = require('path');
var bindir = path.resolve(__dirname, '..', 'bin');

module.exports = function() {
  var bin = bindir;
  if (process.platform === 'win32') {
    bin = path.join(bin, 'jx.exe');
  } else {
    bin = path.join(bin, 'jx');
  }
  return bin;
};
