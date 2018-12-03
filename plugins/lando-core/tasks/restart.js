'use strict';

const utils = require('./../lib/utils');
const message = 'Stopping your app... just so we can start it up again ¯\\_(ツ)_/¯';

module.exports = lando => utils.startToggle(lando, 'restart', message);
