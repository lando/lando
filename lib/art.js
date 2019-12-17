'use strict';

// Modules
const niceFont = require('yargonaut').asFont;
const chalk = require('yargonaut').chalk();
const os = require('os');

/*
 * Helper to stylize code or a command
 */
const codeMe = text => chalk.bgBlack.italic(text);

/*
 * Helper to stylize an appname
 */
const appName = name => chalk.italic(name);

/*
 * Helper to show that an app has started
 */
exports.appDestroy = ({name, phase = 'pre'} = {}) => {
  switch (phase) {
    case 'abort':
      return chalk.yellow('DESTRUCTION AVERTED!');
    case 'pre':
      return chalk.cyan(`Preparing to resign ${appName(name)} to the dustbin of history...`);
    case 'post':
      return [
        chalk.red(`The app known as ${appName(name)} has paid the ${chalk.bold('IRON PRICE')}. App destroyed!`),
      ].join(os.EOL);
  }
};

/*
 * Helper to show that an app has restarted
 */
exports.appRebuild = ({name, phase = 'pre'} = {}) => {
  switch (phase) {
    case 'abort':
      return chalk.yellow('REBUILD ABORTED!');
    case 'pre':
      return chalk.cyan('Rising anew like a fire phoenix from the ashes! Rebuilding app...');
    case 'post':
      return exports.appStart({name, phase});
  }
};

/*
 * Helper to show that an app has restarted
 */
exports.appRestart = ({name, phase = 'pre'} = {}) => {
  switch (phase) {
    case 'pre':
      return chalk.cyan('Stopping your app... just so we can start it up again ¯\\_(ツ)_/¯');
    case 'post':
      return exports.appStart({name, phase});
  }
};

/*
 * Helper to show that an app has stopped
 */
exports.appStop = ({name, phase = 'pre'} = {}) => {
  switch (phase) {
    case 'pre':
      return chalk.cyan(`This party\'s over :( Stopping app ${appName(name)}`);
    case 'post':
      return chalk.red(`App ${appName(name)} has been stopped!`);
  }
};

/*
 * Helper to show that an app has started
 */
exports.appStart = ({name, phase = 'pre'} = {}) => {
  switch (phase) {
    case 'pre':
      return chalk.cyan(`Let\'s get this party started! Starting app ${appName(name)}...`);
    case 'post':
      return [
        '',
        chalk.magenta(niceFont('Boomshakalaka!!!', 'Small Slant')),
        '',
        'Your app has started up correctly.',
        'Here are some vitals:',
        '',
      ].join(os.EOL);
  }
};

/*
 * Helper to show that a first error has occured
 */
exports.crash = () => [
  '',
  chalk.red(niceFont('CRASH!!!', 'ANSI Shadow')),
  '',
  'Would you like to report it, and subsequent crashes, to Lando?',
  '',
  'This data is only used by the Lando team to ensure the application runs as well as it can.',
  chalk.green('For more details check out https://docs.lando.dev/privacy/'),
].join(os.EOL);

/*
 * Helper to show init header
 */
exports.init = () => [
  '',
  chalk.green(niceFont('Now we\'re', 'Small Slant')),
  chalk.magenta(niceFont('COOKING WITH FIRE!', 'Small Slant')),
  'Your app has been initialized!',
  '',
  `Go to the directory where your app was initialized and run ${codeMe('lando start')} to get rolling.`,
  'Check the LOCATION printed below if you are unsure where to go.',
  '',
  'Oh... and here are some vitals:',
  '',
].join(os.EOL);

/*
 * Helper to show status of secret toggle
 */
exports.poweroff = ({phase = 'pre'} = {}) => {
  switch (phase) {
    case 'pre':
      return [
        '',
        chalk.cyan('NO!! SHUT IT ALL DOWN!!!'),
        chalk.magenta(niceFont('Powering off...', 'Small Slant')),
        '',
      ].join(os.EOL);
    case 'post':
      return chalk.green('Lando containers have been spun down.');
  }
};

/*
 * Helper to show status of secret toggle
 */
exports.secretToggle = (on = false) => {
  switch (on) {
    case true:
      return [
        '',
        chalk.green(niceFont('Activated!!!', 'Small Slant')),
        chalk.magenta('The secret toggle is now ON'),
        '',
        `Rerun ${codeMe('lando')} to see the secret commands `,

        '',
      ].join(os.EOL);
    case false:
      return [
        '',
        chalk.red(niceFont('Deactivated!', 'Small Slant')),
        chalk.grey('The secret toggle is now OFF'),
        '',
      ].join(os.EOL);
  }
};

/*
 * Helper to show status of secret toggle
 */
exports.secretToggleDenied = (on = false) => [
  '',
  chalk.red(niceFont('Toggle Denied!', 'Small Slant', true)),
  '',
  chalk.magenta('You can only toggle the secret toggle when running Lando from source'),
  'See https://docs.lando.dev/contrib/activate.html',
  '',
].join(os.EOL);


/*
 * Helper to show status of secret toggle
 */
exports.sudoRun = () => [
  chalk.red('Lando should never ever ever be run as root...'),
  chalk.magenta(niceFont('like ever!!!', 'Small Slant')),
].join(os.EOL);

/*
 * Helper to show status of secret toggle
 */
exports.tunnel = ({url, phase = 'pre'} = {}) => {
  switch (phase) {
    case 'pre':
      return chalk.cyan('About to share your app to a whole new world!');
    case 'post':
      return [
        '',
        chalk.magenta(niceFont('Connected!!!', 'Small Slant')),
        'A tunnel to your local Lando app been established.',
        '',
        'Here is your public url:',
        chalk.green(url),
        '',
        'Press any key to close the tunnel...',
      ].join(os.EOL);
    case 'closed':
      return chalk.green('Tunnel closed!');
  }
};

/*
 * Update available
 */
exports.updateAvailable = url => [
  '',
  chalk.magenta(niceFont('Update Available!!!', 'Small Slant')),
  '',
  'Updating helps us provide the best support and saves us tons of time',
  '',
  'Use the link below to get the latest and greatest',
  chalk.green(url),
  '',
  `If updating from 3.0.0-rc.1 or below it is ${chalk.black.bgYellow.bold('CRITICAL')} you visit both`,
  chalk.green('https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/'),
  chalk.green('https://docs.devwithlando.io/guides/updating-to-rc2.html'),
  '',
].join(os.EOL);

