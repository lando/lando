'use strict';

// Modules
const _ = require('lodash');
const chalk = require('yargonaut').chalk();
const os = require('os');

// Art data
const art = {
  error: [
    chalk.red('Lando has crashed!!!'),
    '',
    'Would you like to report it, and subsequent errors, to Lando?',
    '',
    'This data is only used by the Lando team to ensure the application runs as well as it can.',
    chalk.green('For more details check out https://docs.lando.dev/privacy/'),
  ],
  init: [
    chalk.green('NOW WE\'RE COOKING WITH FIRE!!!'),
    'Your app has been initialized!',
    '',
    'Go to the directory where your app was initialized and run `lando start` to get rolling.',
    'Check the LOCATION printed below if you are unsure where to go.',
    '',
    'Oh... and here are some vitals:',
  ],
  start: [
    chalk.green('BOOMSHAKALAKA!!!'),
    '',
    'Your app has started up correctly.',
    'Here are some vitals:',
  ],
  tunnel: [
    chalk.green('YOU ARE NOW SHARED WITH THE WORLD!!!'),
    '',
    'A local tunnel to your app has been established.',
    '',
    'Here is your public url:',
  ],
  update: [
    chalk.yellow('There is an update available!!!'),
    chalk.yellow('Install it to get the latest and greatest'),
    '',
    'Updating helps us provide the best support.',
  ],
  updateRC2: [
    'If you are updating from 3.0.0-rc.1 or below it is CRITICAL you read the following docs first',
    chalk.green('https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/'),
    chalk.green('https://docs.devwithlando.io/guides/updating-to-rc2.html'),
  ],
};

module.exports = (header = 'start', {paddingTop = 1, paddingBottom = 1} = {}) => {
  return _.map(_.flatten([_.range(paddingTop), art[header], _.range(paddingBottom)]), value => {
    return (_.isInteger(value)) ? '' : value;
  }).join(os.EOL);
};
